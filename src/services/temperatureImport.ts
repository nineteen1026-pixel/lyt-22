import type {
  TemperatureRecord,
  TemperatureAnomalyAlert,
  CSVColumnMapping,
  TemperatureImportResult,
  BluetoothDeviceInfo,
  TemperatureStatistics,
  CyclePhase,
} from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const parseDate = (dateStr: string, format?: string): string => {
  const cleaned = dateStr.trim();
  
  if (cleaned.match(/^\d{4}-\d{2}-\d{2}/)) {
    return cleaned.split(' ')[0];
  }
  
  if (cleaned.match(/^\d{4}\/\d{2}\/\d{2}/)) {
    return cleaned.replace(/\//g, '-').split(' ')[0];
  }
  
  if (cleaned.match(/^\d{2}-\d{2}-\d{4}/)) {
    const parts = cleaned.split('-');
    return `${parts[2]}-${parts[0]}-${parts[1]}`;
  }
  
  if (cleaned.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    const parts = cleaned.split('/');
    return `${parts[2]}-${parts[0]}-${parts[1]}`;
  }
  
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  
  return cleaned;
};

const parseTime = (timeStr: string): string => {
  const cleaned = timeStr.trim();
  
  if (cleaned.match(/^\d{2}:\d{2}/)) {
    return cleaned.substring(0, 5);
  }
  
  if (cleaned.match(/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)/)) {
    const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }
  
  const d = new Date(`2000-01-01 ${cleaned}`);
  if (!isNaN(d.getTime())) {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  
  return '06:00';
};

const parseTemperature = (tempStr: string): number | null => {
  const cleaned = tempStr.trim().replace(/°[CF]/g, '').replace(/,/g, '');
  const temp = parseFloat(cleaned);
  
  if (isNaN(temp)) return null;
  if (temp < 30 || temp > 45) return null;
  
  return Math.round(temp * 100) / 100;
};

export function parseCSVFile(
  csvContent: string,
  mapping: CSVColumnMapping = {
    tempColumn: 'temperature',
    hasHeader: true,
    separator: ',',
  }
): TemperatureImportResult {
  const result: TemperatureImportResult = {
    success: true,
    totalRecords: 0,
    importedRecords: 0,
    skippedRecords: 0,
    errorRecords: [],
    newRecords: [],
  };

  try {
    const separator = mapping.separator || ',';
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
    
    if (lines.length === 0) {
      result.success = false;
      return result;
    }

    let startLine = 0;
    let columnMap: Record<string, number> = {};

    if (mapping.hasHeader) {
      const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase());
      headers.forEach((header, idx) => {
        columnMap[header] = idx;
      });
      startLine = 1;
    }

    result.totalRecords = lines.length - startLine;

    const tempColNames = [
      mapping.tempColumn?.toLowerCase(),
      'temperature',
      'temp',
      '体温',
      '基础体温',
      'basal_temp',
      'basaltemp',
    ].filter(Boolean) as string[];

    const dateColNames = [
      mapping.dateColumn?.toLowerCase(),
      'date',
      '日期',
      '测量日期',
      'record_date',
    ].filter(Boolean) as string[];

    const timeColNames = [
      mapping.timeColumn?.toLowerCase(),
      'time',
      '时间',
      '测量时间',
      'record_time',
    ].filter(Boolean) as string[];

    let tempColIdx = -1;
    let dateColIdx = -1;
    let timeColIdx = -1;

    if (mapping.hasHeader) {
      for (const name of tempColNames) {
        if (columnMap[name] !== undefined) {
          tempColIdx = columnMap[name];
          break;
        }
      }
      for (const name of dateColNames) {
        if (columnMap[name] !== undefined) {
          dateColIdx = columnMap[name];
          break;
        }
      }
      for (const name of timeColNames) {
        if (columnMap[name] !== undefined) {
          timeColIdx = columnMap[name];
          break;
        }
      }
    } else {
      tempColIdx = 0;
      dateColIdx = 1;
      timeColIdx = 2;
    }

    if (tempColIdx === -1) {
      result.success = false;
      result.errorRecords.push({ line: 0, reason: '未找到温度列' });
      return result;
    }

    const records: TemperatureRecord[] = [];

    for (let i = startLine; i < lines.length; i++) {
      const lineNum = i + 1;
      const columns = lines[i].split(separator);

      try {
        const tempStr = columns[tempColIdx]?.trim() || '';
        const temperature = parseTemperature(tempStr);

        if (temperature === null) {
          result.skippedRecords++;
          result.errorRecords.push({
            line: lineNum,
            reason: `温度值无效: ${tempStr}`,
            rawData: lines[i],
          });
          continue;
        }

        let dateStr = '';
        if (dateColIdx >= 0 && columns[dateColIdx]) {
          dateStr = parseDate(columns[dateColIdx]);
        } else {
          const today = new Date();
          today.setDate(today.getDate() - (lines.length - 1 - i));
          dateStr = today.toISOString().split('T')[0];
        }

        let timeStr = '06:00';
        if (timeColIdx >= 0 && columns[timeColIdx]) {
          timeStr = parseTime(columns[timeColIdx]);
        }

        if (!dateStr || dateStr.length < 8) {
          result.skippedRecords++;
          result.errorRecords.push({
            line: lineNum,
            reason: `日期格式无效: ${columns[dateColIdx]}`,
            rawData: lines[i],
          });
          continue;
        }

        records.push({
          id: generateId(),
          date: dateStr,
          time: timeStr,
          temperature,
          source: 'csv',
          basalTemp: true,
        });
      } catch (e) {
        result.skippedRecords++;
        result.errorRecords.push({
          line: lineNum,
          reason: `解析错误: ${e instanceof Error ? e.message : '未知错误'}`,
          rawData: lines[i],
        });
      }
    }

    result.importedRecords = records.length;
    result.newRecords = records;

    const uniqueRecords = deduplicateRecords(records);
    result.newRecords = uniqueRecords;
    result.importedRecords = uniqueRecords.length;

    return result;
  } catch (e) {
    result.success = false;
    result.errorRecords.push({
      line: 0,
      reason: `CSV解析失败: ${e instanceof Error ? e.message : '未知错误'}`,
    });
    return result;
  }
}

export interface BluetoothTemperatureData {
  deviceId: string;
  deviceName?: string;
  temperature: number;
  timestamp: number;
  unit?: 'C' | 'F';
  measurementMethod?: string;
  batteryLevel?: number;
}

export function parseBluetoothData(
  data: BluetoothTemperatureData
): TemperatureRecord | null {
  try {
    const date = new Date(data.timestamp);
    
    if (isNaN(date.getTime())) {
      return null;
    }

    let temperature = data.temperature;
    if (data.unit === 'F') {
      temperature = (temperature - 32) * (5 / 9);
    }

    if (temperature < 30 || temperature > 45) {
      return null;
    }

    const method = data.measurementMethod?.toLowerCase() || '';
    let measurementMethod: TemperatureRecord['method'] = undefined;

    if (method.includes('oral') || method.includes('口')) {
      measurementMethod = 'oral';
    } else if (method.includes('axillary') || method.includes('腋')) {
      measurementMethod = 'axillary';
    } else if (method.includes('ear') || method.includes('耳') || method.includes('tympanic')) {
      measurementMethod = 'tympanic';
    } else if (method.includes('forehead') || method.includes('额')) {
      measurementMethod = 'forehead';
    } else if (method.includes('rectal') || method.includes('肛')) {
      measurementMethod = 'rectal';
    }

    return {
      id: generateId(),
      date: date.toISOString().split('T')[0],
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      temperature: Math.round(temperature * 100) / 100,
      source: 'bluetooth',
      method: measurementMethod,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      basalTemp: false,
    };
  } catch {
    return null;
  }
}

export function parseBluetoothBulkData(
  dataArray: BluetoothTemperatureData[]
): TemperatureImportResult {
  const result: TemperatureImportResult = {
    success: true,
    totalRecords: dataArray.length,
    importedRecords: 0,
    skippedRecords: 0,
    errorRecords: [],
    newRecords: [],
  };

  const records: TemperatureRecord[] = [];

  dataArray.forEach((data, index) => {
    const record = parseBluetoothData(data);
    if (record) {
      records.push(record);
    } else {
      result.skippedRecords++;
      result.errorRecords.push({
        line: index + 1,
        reason: '蓝牙数据格式无效',
        rawData: JSON.stringify(data),
      });
    }
  });

  const uniqueRecords = deduplicateRecords(records);
  result.newRecords = uniqueRecords;
  result.importedRecords = uniqueRecords.length;

  return result;
}

export function standardizeTemperature(
  temp: number,
  method?: string
): { temperature: number; basalAdjusted: boolean } {
  let adjusted = temp;
  let basalAdjusted = false;

  if (method === 'axillary') {
    adjusted = temp + 0.5;
    basalAdjusted = true;
  } else if (method === 'tympanic') {
    adjusted = temp + 0.3;
    basalAdjusted = true;
  } else if (method === 'forehead') {
    adjusted = temp + 0.8;
    basalAdjusted = true;
  } else if (method === 'rectal') {
    adjusted = temp - 0.3;
    basalAdjusted = true;
  }

  return {
    temperature: Math.round(adjusted * 100) / 100,
    basalAdjusted,
  };
}

export function deduplicateRecords(
  records: TemperatureRecord[]
): TemperatureRecord[] {
  const seen = new Map<string, TemperatureRecord>();

  records.forEach((record) => {
    const key = `${record.date}-${record.time}`;
    const existing = seen.get(key);
    
    if (!existing) {
      seen.set(key, record);
    } else if (record.source === 'manual' || record.source === 'device') {
      seen.set(key, record);
    }
  });

  return Array.from(seen.values()).sort((a, b) => 
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );
}

export function mergeRecords(
  existingRecords: TemperatureRecord[],
  newRecords: TemperatureRecord[]
): TemperatureRecord[] {
  const merged = [...existingRecords];
  
  newRecords.forEach((newRec) => {
    const existingIdx = merged.findIndex(
      (r) => r.date === newRec.date && r.time === newRec.time
    );
    
    if (existingIdx === -1) {
      const sameDayIdx = merged.findIndex((r) => r.date === newRec.date);
      if (sameDayIdx === -1) {
        merged.push(newRec);
      } else {
        const existing = merged[sameDayIdx];
        if (newRec.basalTemp && !existing.basalTemp) {
          merged[sameDayIdx] = newRec;
        } else if (newRec.source === 'device' && existing.source !== 'device') {
          merged[sameDayIdx] = newRec;
        }
      }
    }
  });

  return merged.sort((a, b) => 
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );
}

export function detectTemperatureAnomalies(
  records: TemperatureRecord[]
): TemperatureAnomalyAlert[] {
  const alerts: TemperatureAnomalyAlert[] = [];
  const sortedRecords = [...records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );

  if (sortedRecords.length === 0) return alerts;

  const basalRecords = sortedRecords.filter((r) => r.basalTemp);
  
  for (const record of sortedRecords) {
    if (record.temperature >= 38.5) {
      alerts.push({
        id: generateId(),
        type: 'high_fever',
        typeName: '高热',
        severity: 'high',
        date: record.date,
        temperature: record.temperature,
        description: `体温达到 ${record.temperature}°C，属于高热`,
        suggestion: '建议及时就医，多饮水，注意休息',
        acknowledged: false,
      });
    }
    
    if (record.temperature < 35.5) {
      alerts.push({
        id: generateId(),
        type: 'low_temp',
        typeName: '体温过低',
        severity: 'medium',
        date: record.date,
        temperature: record.temperature,
        description: `体温偏低，仅 ${record.temperature}°C`,
        suggestion: '可能与测量方式或环境温度有关，建议复测',
        acknowledged: false,
      });
    }
  }

  if (basalRecords.length >= 2) {
    for (let i = 1; i < basalRecords.length; i++) {
      const prev = basalRecords[i - 1];
      const curr = basalRecords[i];
      const diff = curr.temperature - prev.temperature;

      if (diff >= 0.5) {
        alerts.push({
          id: generateId(),
          type: 'sudden_rise',
          typeName: '体温骤升',
          severity: 'medium',
          date: curr.date,
          temperature: curr.temperature,
          description: `体温较前一天升高 ${diff.toFixed(2)}°C`,
          suggestion: '可能为排卵后体温升高，也可能与身体不适有关',
          acknowledged: false,
        });
      }

      if (diff <= -0.4) {
        alerts.push({
          id: generateId(),
          type: 'sudden_drop',
          typeName: '体温骤降',
          severity: 'medium',
          date: curr.date,
          temperature: curr.temperature,
          description: `体温较前一天下降 ${Math.abs(diff).toFixed(2)}°C`,
          suggestion: '可能与排卵日降温有关，注意观察',
          acknowledged: false,
        });
      }
    }
  }

  const { tempShiftDetected, tempShiftIndex } = detectTempShift(basalRecords);
  
  if (basalRecords.length >= 10 && !tempShiftDetected) {
    const latest = basalRecords[basalRecords.length - 1];
    alerts.push({
      id: generateId(),
      type: 'no_temp_shift',
      typeName: '未检测到体温升高',
      severity: 'low',
      date: latest.date,
      description: '连续记录10天以上未检测到明显的双相体温变化',
      suggestion: '建议继续记录，如持续无排卵迹象可咨询医生',
      acknowledged: false,
    });
  }

  return alerts;
}

export function detectTempShift(records: TemperatureRecord[]): {
  tempShiftDetected: boolean;
  tempShiftIndex: number;
  tempShiftDate?: string;
} {
  const sorted = [...records]
    .filter((r) => r.basalTemp)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 6) {
    return { tempShiftDetected: false, tempShiftIndex: -1 };
  }

  for (let i = 3; i < sorted.length - 2; i++) {
    const prevTemps = sorted.slice(i - 3, i).map((r) => r.temperature);
    const nextTemps = sorted.slice(i, i + 3).map((r) => r.temperature);

    const prevAvg = prevTemps.reduce((a, b) => a + b, 0) / prevTemps.length;
    const nextAvg = nextTemps.reduce((a, b) => a + b, 0) / nextTemps.length;

    if (nextAvg - prevAvg >= 0.2 && nextTemps.every((t) => t > prevAvg + 0.15)) {
      return {
        tempShiftDetected: true,
        tempShiftIndex: i,
        tempShiftDate: sorted[i].date,
      };
    }
  }

  return { tempShiftDetected: false, tempShiftIndex: -1 };
}

export function calculateTemperatureStatistics(
  records: TemperatureRecord[]
): TemperatureStatistics {
  const sorted = [...records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );

  if (sorted.length === 0) {
    return {
      avgTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0,
      tempShiftDetected: false,
      anomalyCount: 0,
      recordCount: 0,
      continuousDays: 0,
    };
  }

  const temps = sorted.map((r) => r.temperature);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

  const latest = sorted[sorted.length - 1];

  const { tempShiftDetected, tempShiftDate } = detectTempShift(sorted);

  let follicularPhaseAvg: number | undefined;
  let lutealPhaseAvg: number | undefined;
  let tempDiff: number | undefined;

  if (tempShiftDetected && tempShiftDate) {
    const shiftDate = new Date(tempShiftDate);
    const follicular = sorted.filter((r) => new Date(r.date) < shiftDate);
    const luteal = sorted.filter((r) => new Date(r.date) >= shiftDate);

    if (follicular.length > 0) {
      follicularPhaseAvg =
        follicular.reduce((sum, r) => sum + r.temperature, 0) / follicular.length;
    }
    if (luteal.length > 0) {
      lutealPhaseAvg =
        luteal.reduce((sum, r) => sum + r.temperature, 0) / luteal.length;
    }
    if (follicularPhaseAvg && lutealPhaseAvg) {
      tempDiff = lutealPhaseAvg - follicularPhaseAvg;
    }
  }

  const anomalies = detectTemperatureAnomalies(records);

  let continuousDays = 0;
  const today = new Date();
  for (let i = sorted.length - 1; i >= 0; i--) {
    const recordDate = new Date(sorted[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - (sorted.length - 1 - i));
    expectedDate.setHours(0, 0, 0, 0);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate.getTime() === expectedDate.getTime()) {
      continuousDays++;
    } else {
      break;
    }
  }

  return {
    avgTemperature: Math.round(avg * 100) / 100,
    minTemperature: Math.min(...temps),
    maxTemperature: Math.max(...temps),
    latestTemperature: latest.temperature,
    latestTemperatureDate: latest.date,
    tempShiftDetected,
    tempShiftDate,
    follicularPhaseAvg: follicularPhaseAvg
      ? Math.round(follicularPhaseAvg * 100) / 100
      : undefined,
    lutealPhaseAvg: lutealPhaseAvg
      ? Math.round(lutealPhaseAvg * 100) / 100
      : undefined,
    tempDiff: tempDiff ? Math.round(tempDiff * 100) / 100 : undefined,
    anomalyCount: anomalies.length,
    recordCount: sorted.length,
    continuousDays,
  };
}

export function generateTemperatureTrend(
  records: TemperatureRecord[],
  days: number = 30
): { date: string; temperature?: number; phase?: CyclePhase }[] {
  const result: { date: string; temperature?: number; phase?: CyclePhase }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayRecords = records.filter((r) => r.date === dateStr);
    const basalRecord = dayRecords.find((r) => r.basalTemp);
    const record = basalRecord || dayRecords[0];

    result.push({
      date: dateStr,
      temperature: record?.temperature,
      phase: record?.cyclePhase,
    });
  }

  return result;
}

export const bluetoothDeviceProfiles: Record<string, Partial<BluetoothDeviceInfo>> = {
  'com.mchhealth.thermo1': {
    brand: 'MCH健康',
    model: 'T1智能体温计',
  },
  'com.basal.temp-pro': {
    brand: 'BasalPro',
    model: '基础体温专用',
  },
  'com.smart.temp-ble': {
    brand: '智温',
    model: '蓝牙体温贴',
  },
};

export function discoverBluetoothDevices(): BluetoothDeviceInfo[] {
  const mockDevices: BluetoothDeviceInfo[] = [
    {
      id: 'bt-001',
      name: 'MCH智能体温计',
      macAddress: 'AA:BB:CC:DD:EE:01',
      brand: 'MCH健康',
      model: 'T1',
      batteryLevel: 85,
    },
    {
      id: 'bt-002',
      name: 'BasalPro 基础体温计',
      macAddress: 'AA:BB:CC:DD:EE:02',
      brand: 'BasalPro',
      model: 'Pro-200',
      batteryLevel: 62,
    },
  ];

  return mockDevices;
}

export function generateMockTemperatureRecords(days: number = 30): TemperatureRecord[] {
  const records: TemperatureRecord[] = [];
  const today = new Date();
  const cycleLength = 28;
  const ovulationDay = 14;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayInCycle = (days - i) % cycleLength;
    
    let baseTemp = 36.4;
    
    if (dayInCycle < ovulationDay) {
      baseTemp = 36.3 + Math.random() * 0.2;
    } else if (dayInCycle === ovulationDay) {
      baseTemp = 36.15 + Math.random() * 0.1;
    } else {
      baseTemp = 36.65 + Math.random() * 0.25;
    }

    const temperature = Math.round(baseTemp * 100) / 100;

    let phase: CyclePhase = 'follicular';
    if (dayInCycle >= 0 && dayInCycle < 5) {
      phase = 'period';
    } else if (dayInCycle >= 5 && dayInCycle < ovulationDay - 1) {
      phase = 'follicular';
    } else if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) {
      phase = 'ovulation';
    } else if (dayInCycle > ovulationDay + 1) {
      phase = 'luteal';
    }

    records.push({
      id: generateId(),
      date: dateStr,
      time: '06:30',
      temperature,
      source: 'device',
      method: 'oral',
      deviceId: 'bt-001',
      deviceName: 'MCH智能体温计',
      basalTemp: true,
      cyclePhase: phase,
    });
  }

  return records;
}
