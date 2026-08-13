import { motion } from 'framer-motion';
import { Download, Upload, FileJson, FileText, BarChart3, Calendar, Copy, Share2, Eye } from 'lucide-react';
import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  exportToCSV,
  exportToJSON,
  exportToPDF,
  generateDateRangeReport,
  importFromJSON,
  importFromCSV,
  importFromPDF,
  shareTasksAsText,
  generateSamplePDF,
  previewPDF
} from '../utils/exportUtils';

export default function ExportReporting() {
  const { tasks, spaces, userProfile, setTasks, addToast } = useTasks();
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import' | 'reports'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedExport, setSelectedExport] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [shareText, setShareText] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  // Handle CSV Export
  const handleCSVExport = () => {
    exportToCSV(tasks, `zenflow-tasks-${new Date().toISOString().split('T')[0]}.csv`);
    addToast('Tasks exported as CSV', () => {});
  };

  // Handle JSON Export (Full Backup)
  const handleJSONExport = () => {
    exportToJSON(tasks, spaces, userProfile, `zenflow-backup-${new Date().toISOString().split('T')[0]}.json`);
    addToast('Full backup exported as JSON', () => {});
  };

  // Handle PDF Export
  const handlePDFExport = async (event) => {
    event?.stopPropagation();
    await exportToPDF(tasks, `zenflow-tasks-${new Date().toISOString().split('T')[0]}.pdf`);
    addToast('Tasks exported as PDF', () => {});
  };

  const handlePDFPreview = async (event) => {
    event?.stopPropagation();
    setSelectedExport('pdf');
    const fileName = `zenflow-tasks-${new Date().toISOString().split('T')[0]}.pdf`;
    const previewWindow = await previewPDF(tasks, fileName);
    if (previewWindow) {
      addToast('PDF preview opened in a new tab', () => {});
      return;
    }
    addToast('Unable to open PDF preview', () => {});
  };

  // Handle File Import
  const handleFileImport = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      let importedTasks = [];

      if (type === 'json') {
        const data = await importFromJSON(file);
        importedTasks = data.tasks || [];
      } else if (type === 'csv') {
        importedTasks = await importFromCSV(file);
      } else if (type === 'pdf') {
        importedTasks = await importFromPDF(file);
      }

      if (importedTasks.length === 0) {
        addToast('No tasks found in file', () => {});
        return;
      }

      // Merge with existing tasks or replace
      const shouldMerge = window.confirm(
        `Import ${importedTasks.length} tasks?\n\nOK: Merge with existing tasks\nCancel: Replace all tasks`
      );

      if (shouldMerge) {
        setTasks(prev => [...prev, ...importedTasks]);
      } else {
        setTasks(importedTasks);
      }

      addToast(`Successfully imported ${importedTasks.length} tasks`, () => {});
    } catch (error) {
      addToast(`Import failed: ${error.message}`, () => {});
    } finally {
      setImportLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Generate Date Range Report
  const handleGenerateReport = () => {
    if (!dateFrom || !dateTo) {
      addToast('Please select both start and end dates', () => {});
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      addToast('Start date must be before end date', () => {});
      return;
    }

    const report = generateDateRangeReport(tasks, dateFrom, dateTo);
    setSelectedReport(report);
  };

  // Handle Share as Text
  const handleShareAsText = () => {
    const text = shareTasksAsText(tasks);
    setShareText(text);
  };

  const getExportCardClassName = (exportType) => {
    const baseClassName = 'group relative overflow-hidden rounded-xl bg-panel border p-5 text-left transition-all hover:border-accent/30 hover:shadow-lg';
    return selectedExport === exportType
      ? `${baseClassName} border-accent bg-accent/5 shadow-lg`
      : `${baseClassName} border-bmuted`;
  };

  // Copy to Clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('Copied to clipboard', () => {});
    } catch (error) {
      addToast('Failed to copy to clipboard', () => {});
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-tmain">Export & Reporting</h2>
        <p className="text-tmuted text-sm mt-1">Manage your tasks data, generate reports, and share with others</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-bmuted">
        {[
          { id: 'export', label: 'Export', icon: Download },
          { id: 'import', label: 'Import', icon: Upload },
          { id: 'reports', label: 'Reports', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                isActive
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-tmuted hover:text-tmain'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {/* CSV Export */}
          <motion.div
            variants={cardVariants}
            role="button"
            tabIndex={0}
            aria-pressed={selectedExport === 'csv'}
            onClick={() => setSelectedExport('csv')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedExport('csv');
              }
            }}
            className={getExportCardClassName('csv')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <FileText className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Export as CSV</h3>
                <p className="text-tmuted text-sm mt-1">
                  Download tasks in CSV format for spreadsheet applications
                </p>
                <p className="text-tmuted text-xs mt-2">{tasks.length} tasks available</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Download CSV"
                  title="Download CSV"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCSVExport();
                  }}
                  className="rounded-lg p-2 text-accent hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* JSON Export */}
          <motion.div
            variants={cardVariants}
            role="button"
            tabIndex={0}
            aria-pressed={selectedExport === 'json'}
            onClick={() => setSelectedExport('json')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedExport('json');
              }
            }}
            className={getExportCardClassName('json')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <FileJson className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Full Backup (JSON)</h3>
                <p className="text-tmuted text-sm mt-1">
                  Complete backup including tasks, spaces, and profile data
                </p>
                <p className="text-tmuted text-xs mt-2">Can be imported later to restore everything</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Download JSON backup"
                  title="Download JSON backup"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleJSONExport();
                  }}
                  className="rounded-lg p-2 text-accent hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* PDF Export */}
          <motion.div
            variants={cardVariants}
            role="button"
            tabIndex={0}
            aria-pressed={selectedExport === 'pdf'}
            onClick={() => setSelectedExport('pdf')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedExport('pdf');
              }
            }}
            className={getExportCardClassName('pdf')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <BarChart3 className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Export as PDF</h3>
                <p className="text-tmuted text-sm mt-1">
                  Generate a formatted PDF report with all task details
                </p>
                <p className="text-tmuted text-xs mt-2">Perfect for printing or sharing</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Preview PDF"
                  title="Preview PDF"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePDFPreview(event);
                  }}
                  className="rounded-lg p-2 text-accent hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Download PDF"
                  title="Download PDF"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePDFExport(event);
                  }}
                  className="rounded-lg p-2 text-accent hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Share as Text */}
          <motion.button
            variants={cardVariants}
            onClick={handleShareAsText}
            className="group relative overflow-hidden rounded-xl bg-panel border border-bmuted p-5 text-left transition-all hover:border-accent/30 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <Share2 className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Share as Text</h3>
                <p className="text-tmuted text-sm mt-1">
                  Copy tasks as formatted text for email or messaging
                </p>
                <p className="text-tmuted text-xs mt-2">Ready to paste anywhere</p>
              </div>
              <Share2 size={20} className="text-accent opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
            </div>
          </motion.button>

          {/* Share Text Preview */}
          {shareText && (
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-panel border border-bmuted p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-tmain text-sm">Shared Text</h4>
                <button
                  onClick={() => copyToClipboard(shareText)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 text-xs font-medium transition-colors"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <pre className="text-xs text-tmuted bg-pbg rounded-lg p-3 overflow-auto max-h-64 font-mono">
                {shareText}
              </pre>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {/* CSV Import */}
          <motion.label
            variants={cardVariants}
            className="group relative overflow-hidden rounded-xl bg-panel border border-dashed border-bmuted p-5 text-left cursor-pointer transition-all hover:border-accent/50 hover:bg-accent/5"
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileImport(e, 'csv')}
              disabled={importLoading}
              className="hidden"
            />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <FileText className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Import CSV</h3>
                <p className="text-tmuted text-sm mt-1">Click to select a CSV file with task data</p>
              </div>
              <Upload size={20} className="text-accent opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
            </div>
          </motion.label>

          {/* JSON Import */}
          <motion.label
            variants={cardVariants}
            className="group relative overflow-hidden rounded-xl bg-panel border border-dashed border-bmuted p-5 text-left cursor-pointer transition-all hover:border-accent/50 hover:bg-accent/5"
          >
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileImport(e, 'json')}
              disabled={importLoading}
              className="hidden"
            />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <FileJson className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Import Backup (JSON)</h3>
                <p className="text-tmuted text-sm mt-1">Restore complete backup with all task data</p>
              </div>
              <Upload size={20} className="text-accent opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
            </div>
          </motion.label>

          {/* PDF Import */}
          <motion.label
            variants={cardVariants}
            className="group relative overflow-hidden rounded-xl bg-panel border border-dashed border-bmuted p-5 text-left cursor-pointer transition-all hover:border-accent/50 hover:bg-accent/5"
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileImport(e, 'pdf')}
              disabled={importLoading}
              className="hidden"
            />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <FileText className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">Import from PDF</h3>
                <p className="text-tmuted text-sm mt-1">Extract tasks from PDF documents automatically</p>
              </div>
              <Upload size={20} className="text-accent opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
            </div>
          </motion.label>

          {/* Download Sample PDF */}
          <motion.button
            variants={cardVariants}
            onClick={generateSamplePDF}
            className="group relative overflow-hidden rounded-xl bg-panel border border-bmuted p-5 text-left transition-all hover:border-accent/30 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <Download className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tmain">📥 Download Sample PDF</h3>
                <p className="text-tmuted text-sm mt-1">Get a template to see how tasks should be formatted</p>
              </div>
              <Download size={20} className="text-accent opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
            </div>
          </motion.button>

          <motion.div
            variants={cardVariants}
            className="rounded-xl bg-accent/10 border border-accent/30 p-4 col-span-full"
          >
            <p className="text-sm text-accent">
              <span className="font-semibold">Note:</span> You'll be asked whether to merge imported tasks with existing ones or replace all tasks.
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Date Range Filter */}
          <motion.div
            variants={cardVariants}
            className="rounded-xl bg-panel border border-bmuted p-5"
          >
            <h3 className="font-semibold text-tmain mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Generate Date Range Report
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tmain mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-pbg border border-bmuted text-tmain placeholder-tmuted focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tmain mb-2">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-pbg border border-bmuted text-tmain placeholder-tmuted focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateReport}
                className="w-full px-4 py-2 rounded-lg bg-accent text-white font-medium transition-colors hover:bg-accent-hover"
              >
                Generate Report
              </button>
            </div>
          </motion.div>

          {/* Report Display */}
          {selectedReport && (
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-panel border border-bmuted p-5 space-y-4"
            >
              <div>
                <h3 className="font-semibold text-tmain mb-3">Report Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-pbg p-3 text-center">
                    <p className="text-2xl font-bold text-accent">{selectedReport.totalTasks}</p>
                    <p className="text-xs text-tmuted mt-1">Total Tasks</p>
                  </div>
                  <div className="rounded-lg bg-pbg p-3 text-center">
                    <p className="text-2xl font-bold text-green-500">{selectedReport.completed}</p>
                    <p className="text-xs text-tmuted mt-1">Completed</p>
                  </div>
                  <div className="rounded-lg bg-pbg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">{selectedReport.pending}</p>
                    <p className="text-xs text-tmuted mt-1">Pending</p>
                  </div>
                  <div className="rounded-lg bg-pbg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-500">{selectedReport.completionRate}%</p>
                    <p className="text-xs text-tmuted mt-1">Completion Rate</p>
                  </div>
                </div>
              </div>

              {/* Period Info */}
              <div className="border-t border-bmuted pt-4">
                <p className="text-sm text-tmuted mb-2">
                  📅 <span className="font-semibold text-tmain">{selectedReport.period.from}</span> to <span className="font-semibold text-tmain">{selectedReport.period.to}</span> ({selectedReport.period.daysIncluded} days)
                </p>
                <p className="text-sm text-tmuted">
                  📊 Average: <span className="font-semibold text-tmain">{selectedReport.averageTasksPerDay}</span> tasks per day
                </p>
              </div>

              {/* Priority Distribution */}
              <div className="border-t border-bmuted pt-4">
                <h4 className="font-medium text-tmain mb-3">Task Distribution by Priority</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-tmuted text-sm">High Priority</span>
                    </div>
                    <span className="font-semibold text-tmain">{selectedReport.byPriority.high}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-tmuted text-sm">Medium Priority</span>
                    </div>
                    <span className="font-semibold text-tmain">{selectedReport.byPriority.medium}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-tmuted text-sm">Low Priority</span>
                    </div>
                    <span className="font-semibold text-tmain">{selectedReport.byPriority.low}</span>
                  </div>
                  {selectedReport.byPriority.none > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-tmuted text-sm">No Priority</span>
                      </div>
                      <span className="font-semibold text-tmain">{selectedReport.byPriority.none}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Distribution */}
              {Object.keys(selectedReport.byCategory).length > 0 && (
                <div className="border-t border-bmuted pt-4">
                  <h4 className="font-medium text-tmain mb-3">Task Distribution by Category</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedReport.byCategory).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-tmuted text-sm capitalize">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-pbg rounded-full h-2">
                            <div 
                              className="bg-accent rounded-full h-2 transition-all"
                              style={{ width: `${(count / selectedReport.totalTasks) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-tmain w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Report as PDF */}
              <button
                onClick={async () => {
                  await exportToPDF(
                    selectedReport.tasks,
                    `zenflow-report-${dateFrom}-to-${dateTo}.pdf`,
                    { dateFrom, dateTo }
                  );
                  addToast('Report exported as PDF', () => {});
                }}
                className="w-full px-4 py-2 rounded-lg bg-accent/10 text-accent font-medium transition-colors hover:bg-accent/20"
              >
                📥 Export Report as PDF
              </button>
            </motion.div>
          )}

          {/* Quick Stats */}
          {!selectedReport && (
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-panel border border-bmuted p-5"
            >
              <h3 className="font-semibold text-tmain mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{tasks.length}</p>
                  <p className="text-xs text-tmuted mt-1">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{tasks.filter(t => t.completed).length}</p>
                  <p className="text-xs text-tmuted mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{tasks.filter(t => !t.completed).length}</p>
                  <p className="text-xs text-tmuted mt-1">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-500">
                    {tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-tmuted mt-1">Completion Rate</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
