/**
 * Customizable Dashboard - Interactive Dashboard Customization
 * 
 * Advanced dashboard with drag-and-drop widgets, resizable panels,
 * saved layouts, and personalized views using React Beautiful DnD.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Layout, 
  Grid, 
  Settings, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2,
  Move,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Copy,
  Edit3
} from 'lucide-react';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'activity' | 'progress' | 'custom';
  title: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  visible: boolean;
  resizable: boolean;
  movable: boolean;
  metadata?: {
    description?: string;
    category?: string;
    tags?: string[];
    lastUpdated?: Date;
  };
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  columns: number;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomizableDashboardProps {
  initialLayout: DashboardLayout;
  availableWidgets: Omit<DashboardWidget, 'id' | 'position'>[];
  onLayoutChange?: (layout: DashboardLayout) => void;
  onSaveLayout?: (layout: DashboardLayout) => void;
  savedLayouts?: DashboardLayout[];
  className?: string;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  initialLayout,
  availableWidgets,
  onLayoutChange,
  onSaveLayout,
  savedLayouts = [],
  className = ''
}) => {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(initialLayout);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  // Update layout when changes occur
  useEffect(() => {
    onLayoutChange?.(currentLayout);
  }, [currentLayout, onLayoutChange]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === 'widget-library' && destination.droppableId === 'dashboard') {
      // Adding new widget from library
      const widgetTemplate = availableWidgets[source.index];
      const newWidget: DashboardWidget = {
        ...widgetTemplate,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: { x: destination.index % currentLayout.columns, y: Math.floor(destination.index / currentLayout.columns) }
      };

      setCurrentLayout(prev => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        updatedAt: new Date()
      }));
    } else if (source.droppableId === 'dashboard' && destination.droppableId === 'dashboard') {
      // Reordering existing widgets
      const newWidgets = Array.from(currentLayout.widgets);
      const [reorderedWidget] = newWidgets.splice(source.index, 1);
      newWidgets.splice(destination.index, 0, reorderedWidget);

      // Update positions
      const updatedWidgets = newWidgets.map((widget, index) => ({
        ...widget,
        position: { 
          x: index % currentLayout.columns, 
          y: Math.floor(index / currentLayout.columns) 
        }
      }));

      setCurrentLayout(prev => ({
        ...prev,
        widgets: updatedWidgets,
        updatedAt: new Date()
      }));
    }
  };

  const addWidget = (widgetTemplate: Omit<DashboardWidget, 'id' | 'position'>) => {
    const newWidget: DashboardWidget = {
      ...widgetTemplate,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: { x: 0, y: currentLayout.widgets.length }
    };

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date()
    }));
  };

  const removeWidget = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
      updatedAt: new Date()
    }));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
      updatedAt: new Date()
    }));
  };

  const duplicateWidget = (widget: DashboardWidget) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${widget.title} (Copy)`,
      position: { x: widget.position.x + 1, y: widget.position.y }
    };

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date()
    }));
  };

  const updateWidgetSize = (widgetId: string, size: DashboardWidget['size']) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, size } : w
      ),
      updatedAt: new Date()
    }));
  };

  const saveCurrentLayout = () => {
    const layoutName = prompt('Enter layout name:');
    if (!layoutName) return;

    const savedLayout: DashboardLayout = {
      ...currentLayout,
      id: `layout-${Date.now()}`,
      name: layoutName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSaveLayout?.(savedLayout);
  };

  const loadLayout = (layout: DashboardLayout) => {
    setCurrentLayout(layout);
    setShowLayoutManager(false);
  };

  const resetLayout = () => {
    setCurrentLayout(initialLayout);
  };

  const getSizeClasses = (size: DashboardWidget['size']) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1 min-h-[200px]';
      case 'medium':
        return 'col-span-2 row-span-1 min-h-[200px]';
      case 'large':
        return 'col-span-2 row-span-2 min-h-[400px]';
      case 'full':
        return 'col-span-full row-span-1 min-h-[200px]';
      default:
        return 'col-span-1 row-span-1 min-h-[200px]';
    }
  };

  const WidgetLibrary = () => (
    <AnimatePresence>
      {showWidgetLibrary && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowWidgetLibrary(false)}
        >
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Widget Library</h3>
              <button
                onClick={() => setShowWidgetLibrary(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <Droppable droppableId="widget-library" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {availableWidgets.map((widget, index) => (
                    <Draggable key={widget.type} draggableId={widget.type} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-move transition-all ${
                            snapshot.isDragging ? 'shadow-lg shadow-brand-primary/20 border-brand-primary' : 'hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{widget.title}</h4>
                            <Move size={16} className="text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {widget.metadata?.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {widget.type}
                            </span>
                            <button
                              onClick={() => addWidget(widget)}
                              className="text-xs bg-brand-primary text-white px-3 py-1 rounded hover:bg-brand-secondary transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const LayoutManager = () => (
    <AnimatePresence>
      {showLayoutManager && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowLayoutManager(false)}
        >
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Layout Manager</h3>
              <button
                onClick={() => setShowLayoutManager(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {savedLayouts.map((layout) => (
                <div key={layout.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{layout.name}</h4>
                      <p className="text-sm text-gray-400">{layout.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{layout.widgets.length} widgets</span>
                        <span>Updated {layout.updatedAt.toLocaleDateString()}</span>
                        {layout.isDefault && (
                          <span className="bg-brand-primary/20 text-brand-primary px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadLayout(layout)}
                        className="text-brand-primary hover:text-brand-secondary transition-colors"
                      >
                        Load
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <WidgetLibrary />
      <LayoutManager />

      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout size={20} className="text-brand-primary" />
            <h2 className="text-xl font-semibold text-white">Customizable Dashboard</h2>
            <span className="text-sm text-gray-400">({currentLayout.widgets.length} widgets)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                isEditMode 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isEditMode ? 'Exit Edit' : 'Edit Mode'}
            </button>
            
            <button
              onClick={() => setShowWidgetLibrary(true)}
              className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Add Widget"
            >
              <Plus size={16} />
            </button>
            
            <button
              onClick={() => setShowLayoutManager(true)}
              className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Manage Layouts"
            >
              <Grid size={16} />
            </button>
            
            <button
              onClick={saveCurrentLayout}
              className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Save Layout"
            >
              <Save size={16} />
            </button>
            
            <button
              onClick={resetLayout}
              className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Reset Layout"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-${currentLayout.columns} gap-6 auto-rows-min transition-colors ${
                  snapshot.isDraggingOver ? 'bg-brand-primary/5 rounded-lg' : ''
                }`}
              >
                {currentLayout.widgets
                  .filter(widget => widget.visible)
                  .map((widget, index) => (
                    <Draggable 
                      key={widget.id} 
                      draggableId={widget.id} 
                      index={index}
                      isDragDisabled={!isEditMode}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${getSizeClasses(widget.size)} ${
                            snapshot.isDragging ? 'z-50 rotate-2 shadow-xl' : ''
                          }`}
                        >
                          <motion.div
                            className={`h-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all ${
                              isEditMode ? 'border-dashed border-brand-primary/50' : 'hover:border-gray-600'
                            }`}
                            whileHover={isEditMode ? { scale: 1.02 } : {}}
                          >
                            {/* Widget Header */}
                            {isEditMode && (
                              <div className="flex items-center justify-between p-3 bg-gray-750 border-b border-gray-700">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex items-center gap-2 cursor-move"
                                >
                                  <Move size={14} className="text-gray-400" />
                                  <span className="text-sm font-medium text-white">{widget.title}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <select
                                    value={widget.size}
                                    onChange={(e) => updateWidgetSize(widget.id, e.target.value as any)}
                                    className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                  >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="full">Full</option>
                                  </select>
                                  
                                  <button
                                    onClick={() => duplicateWidget(widget)}
                                    className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                                    title="Duplicate"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  
                                  <button
                                    onClick={() => toggleWidgetVisibility(widget.id)}
                                    className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                                    title="Toggle Visibility"
                                  >
                                    {widget.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                  </button>
                                  
                                  <button
                                    onClick={() => removeWidget(widget.id)}
                                    className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Widget Content */}
                            <div className={`${isEditMode ? 'p-3' : 'p-6'} h-full`}>
                              {React.createElement(widget.component, {
                                ...widget.props,
                                isEditMode,
                                onEdit: () => setSelectedWidget(widget)
                              })}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </motion.div>
  );
};

export default CustomizableDashboard;
