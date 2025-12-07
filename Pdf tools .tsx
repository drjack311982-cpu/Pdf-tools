"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Download, 
  Trash2, 
  Split, 
  Merge, 
  Sun, 
  Moon,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileWord,
  PenTool,
  Type,
  Check,
  X,
  Home,
  ArrowLeft,
  Menu
} from "lucide-react";

type LayoutOption = "1x1" | "2x1" | "2x2";
type ConversionType = "pdf-word" | "pdf-ppt" | "pdf-excel" | "word-pdf" | "ppt-pdf" | "excel-pdf";
type ToolMode = "home" | "editor" | "signature" | "text";

interface PDFPage {
  id: string;
  number: number;
  thumbnail: string;
}

export default function PDFTools() {
  // State management
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [layout, setLayout] = useState<LayoutOption>("1x1");
  const [isInverted, setIsInverted] = useState(false);
  const [conversionType, setConversionType] = useState<ConversionType>("pdf-word");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("home");
  const [signature, setSignature] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize with sample pages
  useEffect(() => {
    const samplePages: PDFPage[] = Array.from({ length: 8 }, (_, i) => ({
      id: `page-${i + 1}`,
      number: i + 1,
      thumbnail: ""
    }));
    setPages(samplePages);
  }, []);

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, this would process the PDF
      console.log("Processing file:", files[0].name);
      alert(`File "${files[0].name}" selected. In a real app, this would process the PDF.`);
      setToolMode("editor");
    }
  };

  // Page management functions
  const deletePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem) return;
    
    const draggedIndex = pages.findIndex(page => page.id === draggedItem);
    const targetIndex = pages.findIndex(page => page.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newPages = [...pages];
      const [draggedPage] = newPages.splice(draggedIndex, 1);
      newPages.splice(targetIndex, 0, draggedPage);
      setPages(newPages);
    }
    
    setDraggedItem(null);
  };

  // Conversion functions
  const startConversion = () => {
    setIsConverting(true);
    setConversionProgress(0);
    
    // Simulate conversion progress
    const interval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConverting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Signature functions
  const startSignature = () => {
    setToolMode("signature");
    setSelectedPage(null);
  };

  const startTextEditing = () => {
    setToolMode("text");
    setSelectedPage(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode !== "signature" || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || toolMode !== "signature" || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const saveSignature = () => {
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
    setToolMode("editor");
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const saveText = () => {
    setToolMode("editor");
  };

  const cancelEditing = () => {
    setToolMode("editor");
    setText("");
  };

  // Layout classes
  const getLayoutClass = () => {
    switch (layout) {
      case "1x1": return "grid-cols-1";
      case "2x1": return "grid-cols-2";
      case "2x2": return "grid-cols-2 grid-rows-2";
      default: return "grid-cols-1";
    }
  };

  // Return to home
  const returnToHome = () => {
    setToolMode("home");
    setPages([]);
  };

  // Render home screen
  if (toolMode === "home") {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex flex-col ${isInverted ? 'invert' : ''}`}>
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow">
          {/* Header with Menu */}
          <header className="mb-6 py-4 flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Tools
            </h1>
            
            <div className="w-10"></div> {/* Spacer for alignment */}
          </header>

          {/* Menu Dropdown */}
          {showMenu && (
            <Card className="mb-4 bg-white shadow-lg">
              <CardContent className="p-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2"
                  onClick={() => {
                    setShowMenu(false);
                    handleFileUpload();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setShowMenu(false);
                    alert("Recent files option clicked");
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Recent Files
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="flex-grow flex items-center justify-center">
            <Card className="w-full max-w-md bg-white shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                  <FileText className="text-white h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Get Started</h2>
                <p className="text-muted-foreground mb-6">
                  Upload a PDF file to start editing, converting, and annotating
                </p>
                <Button 
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={handleFileUpload}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload PDF
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} PDF Tools. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  // Render editor screen
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${isInverted ? 'invert' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <header className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={returnToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Return
          </Button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PDF Tools
          </h1>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setToolMode("home")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </header>

        {/* Main Controls */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-blue-500" />
              <span>Document Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Layout Selector */}
              <div>
                <Label htmlFor="layout">Page Layout</Label>
                <Select value={layout} onValueChange={(value: LayoutOption) => setLayout(value)}>
                  <SelectTrigger id="layout">
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x1">Single Page</SelectItem>
                    <SelectItem value="2x1">2 Pages Wide</SelectItem>
                    <SelectItem value="2x2">4 Pages Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Mode Toggle */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full bg-white hover:bg-gray-50"
                  onClick={() => setIsInverted(!isInverted)}
                >
                  {isInverted ? (
                    <>
                      <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4 text-indigo-500" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>

              {/* Upload Button */}
              <div className="flex items-end">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={handleFileUpload}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editing Tools */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <PenTool className="text-purple-500" />
              <span>Editing Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                variant={toolMode === "signature" ? "default" : "outline"}
                className={toolMode === "signature" ? "bg-purple-600 hover:bg-purple-700" : ""}
                onClick={startSignature}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Signature
              </Button>
              
              <Button 
                variant={toolMode === "text" ? "default" : "outline"}
                className={toolMode === "text" ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={startTextEditing}
              >
                <Type className="mr-2 h-4 w-4" />
                Add Text
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setToolMode("editor")}
              >
                Select Pages
              </Button>
            </div>

            {/* Signature Canvas */}
            {toolMode === "signature" && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Draw your signature</h3>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="border rounded bg-white w-full cursor-crosshair"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={clearSignature}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={saveSignature}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Text Editor */}
            {toolMode === "text" && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Add text to document</h3>
                <Textarea
                  placeholder="Enter your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mb-3"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={saveText}
                  >
                    Add Text
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Section */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-500" />
              <span>Convert Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="conversion">Conversion Type</Label>
                <Select 
                  value={conversionType} 
                  onValueChange={(value: ConversionType) => setConversionType(value)}
                >
                  <SelectTrigger id="conversion">
                    <SelectValue placeholder="Select conversion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf-word">PDF to Word</SelectItem>
                    <SelectItem value="pdf-ppt">PDF to PowerPoint</SelectItem>
                    <SelectItem value="pdf-excel">PDF to Excel</SelectItem>
                    <SelectItem value="word-pdf">Word to PDF</SelectItem>
                    <SelectItem value="ppt-pdf">PowerPoint to PDF</SelectItem>
                    <SelectItem value="excel-pdf">Excel to PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  onClick={startConversion}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <span className="mr-2">Converting...</span>
                      <span>{conversionProgress}%</span>
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Convert
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={conversionProgress < 100}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            {isConverting && (
              <div className="mt-4">
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${conversionProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page Management */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex it
