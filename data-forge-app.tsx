import React, { useState } from 'react';
import { Upload, Database, FileText, Tag, Download, Settings, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DataForge = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleFileUpload = (event) => {
    setProcessing(true);
    const newFiles = Array.from(event.target.files).map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type,
      status: 'uploaded'
    }));
    
    setFiles([...files, ...newFiles]);
    setNotification({
      type: 'success',
      message: `Successfully uploaded ${newFiles.length} file(s)`
    });
    setProcessing(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'import':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="text-lg font-medium">Drop files here or click to upload</span>
                <span className="text-sm text-gray-500">
                  Support for CSV, JSON, TXT, PDF, and more
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
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
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
      
      case 'annotate':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Data Annotation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-gray-500">
                Select files from the import tab to begin annotation
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select a tab to get started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-gray-500">
                Choose an option from the sidebar
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Data Forge</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: 'import', icon: Upload, label: 'Import Data' },
                { id: 'annotate', icon: Tag, label: 'Annotate' },
                { id: 'transform', icon: Database, label: 'Transform' },
                { id: 'export', icon: Download, label: 'Export' },
                { id: 'analytics', icon: BarChart, label: 'Analytics' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === item.id
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {notification && (
              <Alert className="mb-4">
                <AlertDescription>
                  {notification.message}
                </AlertDescription>
              </Alert>
            )}
            
            {processing ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-pulse">Processing...</div>
                </CardContent>
              </Card>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataForge;