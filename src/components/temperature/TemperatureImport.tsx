import { useState, useRef } from 'react';
import {
  Upload,
  Bluetooth,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Thermometer,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  parseCSVFile,
  discoverBluetoothDevices,
  readBluetoothTemperature,
  isWebBluetoothSupported,
} from '@/services/temperatureImport';
import type { TemperatureImportResult, BluetoothDeviceInfo } from '@/types';

type ImportTab = 'csv' | 'bluetooth' | 'manual';

export default function TemperatureImport({ onClose }: { onClose?: () => void }) {
  const {
    addTemperatureRecords,
    bluetoothDevices,
    addBluetoothDevice,
    temperatureRecords,
    detectTemperatureAnomalies,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<ImportTab>('csv');
  const [importResult, setImportResult] = useState<TemperatureImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDeviceInfo[]>([]);
  const [scanWarning, setScanWarning] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [csvSeparator, setCsvSeparator] = useState<',' | ';' | '\t'>(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [manualTemp, setManualTemp] = useState('36.5');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('06:30');
  const [manualMethod, setManualMethod] = useState('oral');
  const [isSyncing, setIsSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = parseCSVFile(text, {
        tempColumn: 'temperature',
        hasHeader,
        separator: csvSeparator,
      });

      if (result.newRecords.length > 0) {
        const recordsWithoutId = result.newRecords.map(({ id, ...rest }) => rest);
        addTemperatureRecords(recordsWithoutId);
      }

      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: [
          { line: 0, reason: `文件读取失败: ${error instanceof Error ? error.message : '未知错误'}` },
        ],
        newRecords: [],
      });
    } finally {
      setIsImporting(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScanBluetooth = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    setScanWarning(null);

    try {
      const result = await discoverBluetoothDevices();
      setDiscoveredDevices(result.devices);
      setIsSimulated(result.isSimulated);
      if (result.warning) setScanWarning(result.warning);
    } catch (err: any) {
      setScanWarning(err?.message || '扫描蓝牙设备时发生错误');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (device: BluetoothDeviceInfo) => {
    setIsSyncing(true);
    const existing = bluetoothDevices.find((d) => d.id === device.id);
    if (!existing) {
      addBluetoothDevice({ ...device, lastConnected: new Date().toISOString().split('T')[0] });
    }

    try {
      const record = await readBluetoothTemperature(device.id, device.name);
      if (record) {
        const { id, ...rest } = record;
        addTemperatureRecords([rest]);

        setImportResult({
          success: true,
          totalRecords: 1,
          importedRecords: 1,
          skippedRecords: 0,
          errorRecords: [],
          newRecords: [],
        });
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 1,
        errorRecords: [{ line: 0, reason: err?.message || '读取设备数据失败' }],
        newRecords: [],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualAdd = () => {
    const temp = parseFloat(manualTemp);
    if (isNaN(temp) || temp < 30 || temp > 45) {
      setImportResult({
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 1,
        errorRecords: [{ line: 1, reason: '温度值无效' }],
        newRecords: [],
      });
      return;
    }

    addTemperatureRecords([
      {
        date: manualDate,
        time: manualTime,
        temperature: Math.round(temp * 100) / 100,
        source: 'manual',
        method: manualMethod as 'oral' | 'axillary' | 'tympanic' | 'rectal' | 'forehead',
        basalTemp: true,
      },
    ]);

    setImportResult({
      success: true,
      totalRecords: 1,
      importedRecords: 1,
      skippedRecords: 0,
      errorRecords: [],
      newRecords: [],
    });
  };

  const anomalies = detectTemperatureAnomalies();
  const unacknowledgedAnomalies = anomalies.filter((a) => !a.acknowledged);

  const tabs: { key: ImportTab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { key: 'csv', label: 'CSV导入', icon: FileText, desc: '从CSV文件批量导入体温数据' },
    { key: 'bluetooth', label: '蓝牙设备', icon: Bluetooth, desc: '连接蓝牙体温计实时同步' },
    { key: 'manual', label: '手动录入', icon: Thermometer, desc: '手动输入体温数据' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setImportResult(null);
              }}
              className={cn(
                'p-4 rounded-xl text-left transition-all',
                isActive
                  ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg'
                  : 'bg-white border border-gray-200 hover:border-rose-300 hover:shadow-md'
              )}
            >
              <Icon className={cn('w-6 h-6 mb-2', isActive ? 'text-white' : 'text-rose-500')} />
              <p className={cn('font-bold', isActive ? 'text-white' : 'text-gray-800')}>
                {tab.label}
              </p>
              <p className={cn('text-xs mt-1', isActive ? 'text-white/80' : 'text-gray-500')}>
                {tab.desc}
              </p>
            </button>
          );
        })}
      </div>

      {activeTab === 'csv' && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="font-medium text-gray-700 mb-1">点击或拖拽CSV文件到此处</p>
            <p className="text-sm text-gray-500">支持 .csv, .txt 格式文件</p>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            高级设置
          </button>

          {showAdvanced && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">分隔符</label>
                <div className="flex gap-2">
                  {[
                    { value: ',', label: '逗号 (,)' },
                    { value: ';', label: '分号 (;)' },
                    { value: '\t', label: '制表符 (Tab)' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCsvSeparator(opt.value as ',' | ';' | '\t')}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm transition-all',
                        csvSeparator === opt.value
                          ? 'bg-rose-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasHeader"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="w-4 h-4 accent-rose-500"
                />
                <label htmlFor="hasHeader" className="text-sm text-gray-700">
                  文件包含表头行
                </label>
              </div>

              <div className="p-3 bg-sky-50 rounded-lg">
                <p className="text-xs text-sky-700">
                  <strong>CSV格式说明：</strong>文件应包含日期、时间、体温等列，
                  系统会自动识别常见的列名（date, time, temperature, 体温, 日期, 时间等）。
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Download className="w-4 h-4" />
            <a href="#" className="text-rose-500 hover:underline">
              下载CSV模板文件
            </a>
          </div>
        </div>
      )}

      {activeTab === 'bluetooth' && (
        <div className="space-y-4">
          {!isWebBluetoothSupported() && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">当前浏览器不支持 Web Bluetooth</p>
                  <p className="text-xs text-amber-600 mt-1">
                    蓝牙功能目前以模拟模式运行。建议使用 Chrome / Edge / Opera 浏览器，并通过 HTTPS 或 localhost 访问以使用真实蓝牙功能。
                  </p>
                </div>
              </div>
            </div>
          )}

          {scanWarning && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-sky-800">提示</p>
                  <p className="text-xs text-sky-600 mt-1">{scanWarning}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-sky-800">
                  蓝牙连接说明
                  {isSimulated && (
                    <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] align-middle">
                      模拟模式
                    </span>
                  )}
                </p>
                <p className="text-xs text-sky-600 mt-1">
                  确保蓝牙体温计已开启并处于配对模式，点击扫描按钮在系统弹窗中选择要配对的设备。
                  模拟模式下将展示演示设备，点击连接会生成模拟体温数据。
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleScanBluetooth}
            disabled={isScanning}
            className={cn(
              'w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
              isScanning
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:shadow-lg'
            )}
          >
            <Bluetooth className={cn('w-5 h-5', isScanning && 'animate-pulse')} />
            {isScanning ? '正在扫描设备...' : '扫描蓝牙设备'}
          </button>

          {discoveredDevices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">发现的设备</p>
                {isSimulated && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">
                    模拟数据
                  </span>
                )}
              </div>
              {discoveredDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                      <Thermometer className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{device.name}</p>
                        {device.isSimulated && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">模拟</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {device.brand} · {device.model}
                        {device.batteryLevel !== undefined && ` · ${device.batteryLevel}%`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectDevice(device)}
                    disabled={isSyncing}
                    className={cn(
                      'px-4 py-2 text-white text-sm rounded-lg transition-colors',
                      isSyncing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-sky-500 hover:bg-sky-600'
                    )}
                  >
                    连接
                  </button>
                </div>
              ))}
            </div>
          )}

          {bluetoothDevices.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">已配对设备</p>
              {bluetoothDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{device.name}</p>
                        {device.isSimulated && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">模拟</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-600">
                        已连接 · 电量 {device.batteryLevel || '?'}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectDevice(device)}
                    disabled={isSyncing}
                    className={cn(
                      'px-3 py-1.5 text-white text-sm rounded-lg transition-colors flex items-center gap-1',
                      isSyncing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    )}
                  >
                    <Zap className="w-3 h-3" />
                    {isSyncing ? '同步中' : '同步数据'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">日期</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">时间</label>
              <input
                type="time"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">体温 (°C)</label>
            <input
              type="number"
              step="0.1"
              value={manualTemp}
              onChange={(e) => setManualTemp(e.target.value)}
              className="w-full px-4 py-3 text-2xl font-bold text-center rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">测量方式</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'oral', label: '口腔' },
                { value: 'axillary', label: '腋下' },
                { value: 'tympanic', label: '耳温' },
                { value: 'forehead', label: '额温' },
                { value: 'rectal', label: '肛温' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setManualMethod(opt.value)}
                  className={cn(
                    'py-2 rounded-lg text-sm transition-all',
                    manualMethod === opt.value
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-rose-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleManualAdd}
            className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            添加记录
          </button>
        </div>
      )}

      {importResult && (
        <div
          className={cn(
            'p-4 rounded-xl border',
            importResult.success
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-rose-50 border-rose-200'
          )}
        >
          <div className="flex items-start gap-3">
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                {importResult.success ? '导入成功' : '导入失败'}
              </p>
              {importResult.success && (
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    共 <strong>{importResult.totalRecords}</strong> 条
                  </span>
                  <span className="text-emerald-600">
                    成功 <strong>{importResult.importedRecords}</strong> 条
                  </span>
                  {importResult.skippedRecords > 0 && (
                    <span className="text-amber-600">
                      跳过 <strong>{importResult.skippedRecords}</strong> 条
                    </span>
                  )}
                </div>
              )}
              {importResult.errorRecords.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-rose-600 font-medium mb-2">错误详情：</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errorRecords.slice(0, 5).map((err, idx) => (
                      <p key={idx} className="text-xs text-rose-600 bg-rose-100/50 px-2 py-1 rounded">
                        第 {err.line} 行: {err.reason}
                      </p>
                    ))}
                    {importResult.errorRecords.length > 5 && (
                      <p className="text-xs text-rose-500">
                        ...还有 {importResult.errorRecords.length - 5} 条错误
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {unacknowledgedAnomalies.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                检测到 {unacknowledgedAnomalies.length} 个体温异常
              </p>
              <div className="mt-2 space-y-1">
                {unacknowledgedAnomalies.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm border',
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <span className="font-medium">{alert.typeName}</span>
                    <span className="mx-2">·</span>
                    <span>{alert.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400">
        当前共 {temperatureRecords.length} 条体温记录
      </div>
    </div>
  );
}
