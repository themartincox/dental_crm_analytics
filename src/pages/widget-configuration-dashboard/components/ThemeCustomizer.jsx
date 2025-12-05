import React, { useState } from 'react';
import { Palette, RotateCcw, Copy, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ThemeCustomizer = ({ widget, onUpdate }) => {
  const [theme, setTheme] = useState(widget?.theme || {});
  const [presetThemes] = useState([
    {
      name: 'Default Blue',
      theme: {
        primaryColor: '#0066cc',
        secondaryColor: '#004499',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        spacing: '16px'
      }
    },
    {
      name: 'Professional Green',
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderRadius: '6px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        spacing: '16px'
      }
    },
    {
      name: 'Modern Purple',
      theme: {
        primaryColor: '#7c3aed',
        secondaryColor: '#5b21b6',
        backgroundColor: '#fefefe',
        textColor: '#374151',
        borderRadius: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        spacing: '18px'
      }
    },
    {
      name: 'Emergency Red',
      theme: {
        primaryColor: '#dc2626',
        secondaryColor: '#b91c1c',
        backgroundColor: '#fef2f2',
        textColor: '#1f2937',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        spacing: '16px'
      }
    }
  ]);

  const handleThemeChange = (key, value) => {
    const updatedTheme = { ...theme, [key]: value };
    setTheme(updatedTheme);
    onUpdate({ ...widget, theme: updatedTheme });
  };

  const applyPresetTheme = (preset) => {
    setTheme(preset?.theme);
    onUpdate({ ...widget, theme: preset?.theme });
  };

  const resetToDefault = () => {
    const defaultTheme = presetThemes?.[0]?.theme;
    setTheme(defaultTheme);
    onUpdate({ ...widget, theme: defaultTheme });
  };

  const exportTheme = () => {
    const themeJson = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget?.name?.replace(/\s+/g, '-')?.toLowerCase()}-theme.json`;
    a?.click();
    URL.revokeObjectURL(url);
  };

  const copyThemeCSS = () => {
    const css = `/* DentalCRM Widget Theme */
:root {
  --widget-primary: ${theme?.primaryColor};
  --widget-secondary: ${theme?.secondaryColor};
  --widget-background: ${theme?.backgroundColor};
  --widget-text: ${theme?.textColor};
  --widget-radius: ${theme?.borderRadius};
  --widget-font: ${theme?.fontFamily};
  --widget-font-size: ${theme?.fontSize};
  --widget-spacing: ${theme?.spacing};
}`;
    
    navigator.clipboard?.writeText(css);
    // Show success notification
    alert('Theme CSS copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette size={20} />
            Theme Customizer
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyThemeCSS}>
              <Copy size={16} />
              Copy CSS
            </Button>
            <Button variant="outline" size="sm" onClick={exportTheme}>
              <Download size={16} />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Theme Presets */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-3">
            {presetThemes?.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPresetTheme(preset)}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset?.theme?.primaryColor }}
                  />
                  <span className="text-sm font-medium">{preset?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: preset?.theme?.primaryColor }}
                  />
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: preset?.theme?.secondaryColor }}
                  />
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: preset?.theme?.backgroundColor, border: '1px solid #e5e7eb' }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Customization */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Colors</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme?.primaryColor || '#0066cc'}
                  onChange={(e) => handleThemeChange('primaryColor', e?.target?.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={theme?.primaryColor || '#0066cc'}
                  onChange={(e) => handleThemeChange('primaryColor', e?.target?.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme?.secondaryColor || '#004499'}
                  onChange={(e) => handleThemeChange('secondaryColor', e?.target?.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={theme?.secondaryColor || '#004499'}
                  onChange={(e) => handleThemeChange('secondaryColor', e?.target?.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleThemeChange('backgroundColor', e?.target?.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={theme?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleThemeChange('backgroundColor', e?.target?.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme?.textColor || '#333333'}
                  onChange={(e) => handleThemeChange('textColor', e?.target?.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={theme?.textColor || '#333333'}
                  onChange={(e) => handleThemeChange('textColor', e?.target?.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Typography</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <Select
                value={theme?.fontFamily || 'Inter, system-ui, sans-serif'}
                onValueChange={(value) => handleThemeChange('fontFamily', value)}
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="system-ui, sans-serif">System UI</option>
                <option value="'Helvetica Neue', Arial, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times</option>
                <option value="'Courier New', monospace">Courier</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <Select
                value={theme?.fontSize || '14px'}
                onValueChange={(value) => handleThemeChange('fontSize', value)}
              >
                <option value="12px">Small (12px)</option>
                <option value="14px">Medium (14px)</option>
                <option value="16px">Large (16px)</option>
                <option value="18px">Extra Large (18px)</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Layout</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Select
                value={theme?.borderRadius || '8px'}
                onValueChange={(value) => handleThemeChange('borderRadius', value)}
              >
                <option value="0px">None (0px)</option>
                <option value="4px">Small (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Large (12px)</option>
                <option value="16px">Extra Large (16px)</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spacing
              </label>
              <Select
                value={theme?.spacing || '16px'}
                onValueChange={(value) => handleThemeChange('spacing', value)}
              >
                <option value="12px">Compact (12px)</option>
                <option value="16px">Medium (16px)</option>
                <option value="20px">Comfortable (20px)</option>
                <option value="24px">Spacious (24px)</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Preview Colors */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Color Preview</h4>
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
               style={{ backgroundColor: theme?.backgroundColor }}>
            <div 
              className="px-4 py-2 rounded text-white text-sm font-medium"
              style={{ 
                backgroundColor: theme?.primaryColor,
                borderRadius: theme?.borderRadius
              }}
            >
              Primary Button
            </div>
            <div 
              className="px-4 py-2 rounded text-white text-sm font-medium"
              style={{ 
                backgroundColor: theme?.secondaryColor,
                borderRadius: theme?.borderRadius
              }}
            >
              Secondary Button
            </div>
            <div 
              className="text-sm"
              style={{ 
                color: theme?.textColor,
                fontFamily: theme?.fontFamily,
                fontSize: theme?.fontSize
              }}
            >
              Sample Text
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;