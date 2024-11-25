import React, { useState, useEffect } from 'react';
import { 
  Upload, Database, FileText, Tag, Download, Settings, 
  BarChart, Menu, Sun, Moon, X, ArrowRight, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DataForge = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('json');

  // Handle dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleFileUpload = (event) => {
    setProcessing(true);
    const newFiles = Array.from(event.target.files).map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type,
      status: 'uploaded',
      content: null
    }));
    
    // Read file contents
    newFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newFiles[index].content = e.target.result;
        if (index === newFiles.length - 1) {
          setFiles([...files, ...newFiles]);
          setProcessing(false);
          setNotification({
            type: 'success',
            message: `Successfully uploaded ${newFiles.length} file(s)`
          });
        }
      };
      reader.readAsText(event.target.files[index]);
    });
  };

  const transformData = () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    setTimeout(() => {
      const transformedFiles = files.map(file => {
        let content = file.content;
        try {
          // Parse content based on file type
          const data = file.type.includes('csv') 
            ? csvToJson(content)
            : JSON.parse(content);

          // Convert to selected format
          const transformed = selectedFormat === 'json' 
            ? JSON.stringify(data, null, 2)
            : selectedFormat === 'csv' 
            ? jsonToCsv(data)
            : content;

          return {
            ...file,
            content: transformed,
            status: 'transformed'
          };
        } catch (error) {
          return {
            ...file,
            status: 'error',
            error: error.message
          };
        }
      });

      setFiles(transformedFiles);
      setProcessing(false);
      setNotification({
        type: 'success',
        message: 'Data transformation complete'
      });
    }, 1000);
  };

  const csvToJson = (csv) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim();
        return obj;
      }, {});
    });
  };

  const jsonToCsv = (json) => {
    if (!Array.isArray(json)) json = [json];
    const headers = Object.keys(json[0]);
    const rows = json.map(obj => 
      headers.map(header => obj[header]).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const renderInstructions = () => {
    const instructions = {
      import: (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            How to Import Data
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Drag and drop files or click to upload</li>
            <li>Supported formats: CSV, JSON, TXT</li>
            <li>Multiple files can be uploaded at once</li>
            <li>Files will be processed automatically</li>
          </ol>
        </div>
      ),
      transform: (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Data Transformation Guide
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select desired output format</li>
            <li>Choose transformation options</li>
            <li>Preview transformed data</li>
            <li>Apply transformations to all files</li>
          </ol>
        </div>
      ),
      annotate: (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Data Annotation Guidelines
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select data for annotation</li>
            <li>Choose annotation type</li>
            <li>Add labels and categories</li>
            <li>Review and validate annotations</li>
          </ol>
        </div>
      ),
      export: (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Export Options
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select files to export</li>
            <li>Choose export format</li>
            <li>Configure export settings</li>
            <li>Download transformed data</li>
          </ol>
        </div>
      )
    };

    return instructions[activeTab] || null;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'import':
        return (
          <div className="space-y-4">
            {renderInstructions()}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                <span className="text-lg font-medium dark:text-gray-300">
                  Drop files here or click to upload
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Support for CSV, JSON, TXT files
                </span>
              </label>
            </div>
            
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{file.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.size}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'transform':
        return (
          <div className="space-y-4">
            {renderInstructions()}
            <Card>
              <CardHeader>
                <CardTitle>Transform Data</CardTitle>
                <CardDescription>
                  Convert your data between different formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Select
                      value={selectedFormat}
                      onValueChange={setSelectedFormat}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="raw">Raw Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={transformData}>
                      Transform
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {files.map((file, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{file.name}</span>
                            <span className={`text-sm ${
                              file.status === 'error' ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {file.status}
                            </span>
                          </div>
                          <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                            {file.content?.slice(0, 200) + '...'}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderInstructions()}
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                This feature is coming soon
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const navItems = [
    { id: 'import', icon: Upload, label: 'Import Data' },
    { id: 'annotate', icon: Tag, label: 'Annotate' },
    { id: 'transform', icon: Database, label: 'Transform' },
    { id: 'export', icon: Download, label: 'Export' },
    { id: 'analytics', icon: BarChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Forge</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-full"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900/50 backdrop-blur">
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-4">
              <nav className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === item.id
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`