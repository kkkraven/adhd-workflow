import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeMode, InterfaceSettings } from '../types';

export const ThemeSettings: React.FC = () => {
  const { settings, updateSettings, colorSchemes } = useTheme();

  const handleModeChange = (mode: ThemeMode) => {
    updateSettings({ mode });
  };

  const handleColorSchemeChange = (scheme: typeof colorSchemes[0]) => {
    updateSettings({ colorScheme: scheme });
  };

  const handleInterfaceChange = (interfaceSettings: Partial<InterfaceSettings>) => {
    updateSettings({ interface: { ...settings.interface, ...interfaceSettings } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6">Настройки интерфейса</h2>

      {/* Режим темы */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Режим темы</h3>
        <div className="flex gap-4">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.mode === mode
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {mode === 'light' ? 'Светлая' : mode === 'dark' ? 'Темная' : 'Системная'}
            </button>
          ))}
        </div>
      </div>

      {/* Цветовые схемы */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Цветовая схема</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => handleColorSchemeChange(scheme)}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.colorScheme.name === scheme.name
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: scheme.primary }}
                />
                <span>{scheme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Настройки интерфейса */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Настройки интерфейса</h3>

        {/* Размер шрифта */}
        <div>
          <label className="block text-sm font-medium mb-2">Размер шрифта</label>
          <select
            value={settings.interface.fontSize}
            onChange={(e) => handleInterfaceChange({ fontSize: e.target.value as InterfaceSettings['fontSize'] })}
            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <option value="small">Маленький</option>
            <option value="medium">Средний</option>
            <option value="large">Большой</option>
          </select>
        </div>

        {/* Отступы */}
        <div>
          <label className="block text-sm font-medium mb-2">Отступы</label>
          <select
            value={settings.interface.spacing}
            onChange={(e) => handleInterfaceChange({ spacing: e.target.value as InterfaceSettings['spacing'] })}
            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <option value="compact">Компактные</option>
            <option value="comfortable">Комфортные</option>
            <option value="spacious">Просторные</option>
          </select>
        </div>

        {/* Скругление углов */}
        <div>
          <label className="block text-sm font-medium mb-2">Скругление углов</label>
          <select
            value={settings.interface.borderRadius}
            onChange={(e) => handleInterfaceChange({ borderRadius: e.target.value as InterfaceSettings['borderRadius'] })}
            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <option value="none">Нет</option>
            <option value="small">Маленькое</option>
            <option value="medium">Среднее</option>
            <option value="large">Большое</option>
          </select>
        </div>

        {/* Анимации */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Анимации</label>
          <button
            onClick={() => handleInterfaceChange({ animations: !settings.interface.animations })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.interface.animations ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.interface.animations ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Уменьшенное движение */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Уменьшенное движение</label>
          <button
            onClick={() => handleInterfaceChange({ reducedMotion: !settings.interface.reducedMotion })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.interface.reducedMotion ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.interface.reducedMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}; 