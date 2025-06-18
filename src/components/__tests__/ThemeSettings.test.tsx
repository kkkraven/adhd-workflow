import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSettings } from '../ThemeSettings';
import { ThemeProvider } from '../../contexts/ThemeContext';

describe('ThemeSettings', () => {
  it('рендерит все настройки темы', () => {
    render(
      <ThemeProvider>
        <ThemeSettings />
      </ThemeProvider>
    );

    // Проверяем наличие всех основных элементов
    expect(screen.getByText('Настройки интерфейса')).toBeInTheDocument();
    expect(screen.getByText('Режим темы')).toBeInTheDocument();
    expect(screen.getByText('Цветовая схема')).toBeInTheDocument();
    expect(screen.getByText('Размер шрифта')).toBeInTheDocument();
    expect(screen.getByText('Отступы')).toBeInTheDocument();
    expect(screen.getByText('Скругление углов')).toBeInTheDocument();
    expect(screen.getByText('Анимации')).toBeInTheDocument();
    expect(screen.getByText('Уменьшенное движение')).toBeInTheDocument();
  });

  it('позволяет изменить режим темы', () => {
    render(
      <ThemeProvider>
        <ThemeSettings />
      </ThemeProvider>
    );

    const lightButton = screen.getByText('Светлая');
    const darkButton = screen.getByText('Темная');
    const systemButton = screen.getByText('Системная');

    // Проверяем начальное состояние
    expect(lightButton).toHaveClass('bg-primary-500');
    expect(darkButton).not.toHaveClass('bg-primary-500');
    expect(systemButton).not.toHaveClass('bg-primary-500');

    // Меняем тему
    fireEvent.click(darkButton);

    // Проверяем новое состояние
    expect(lightButton).not.toHaveClass('bg-primary-500');
    expect(darkButton).toHaveClass('bg-primary-500');
    expect(systemButton).not.toHaveClass('bg-primary-500');
  });

  it('позволяет изменить размер шрифта', () => {
    render(
      <ThemeProvider>
        <ThemeSettings />
      </ThemeProvider>
    );

    const fontSizeSelect = screen.getByLabelText('Размер шрифта');
    
    // Проверяем начальное значение
    expect(fontSizeSelect).toHaveValue('medium');

    // Меняем размер
    fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

    // Проверяем новое значение
    expect(fontSizeSelect).toHaveValue('large');
  });

  it('позволяет включить/выключить анимации', () => {
    render(
      <ThemeProvider>
        <ThemeSettings />
      </ThemeProvider>
    );

    const animationsToggle = screen.getByRole('button', { name: /анимации/i });
    
    // Проверяем начальное состояние
    expect(animationsToggle).toHaveClass('bg-primary-500');

    // Выключаем анимации
    fireEvent.click(animationsToggle);

    // Проверяем новое состояние
    expect(animationsToggle).not.toHaveClass('bg-primary-500');
  });
}); 