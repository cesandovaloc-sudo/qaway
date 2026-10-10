import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnPickerModal } from '@/components/reports/ColumnPickerModal'
import { SALES_REPORT_COLUMNS, enabledReportColumnKeys } from '@/utils/salesExport'

const enabledKeys = enabledReportColumnKeys()

const renderModal = (over: Partial<React.ComponentProps<typeof ColumnPickerModal>> = {}) => {
  const props = {
    open: true,
    title: 'Descargar reporte',
    subtitle: 'Selecciona las columnas',
    options: SALES_REPORT_COLUMNS,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...over,
  }
  const utils = render(<ColumnPickerModal {...props} />)
  return { ...utils, props }
}

describe('ColumnPickerModal', () => {
  it('muestra el título y todas las opciones con las habilitadas marcadas', () => {
    renderModal()
    expect(screen.getByText('Descargar reporte')).toBeDefined()
    expect(screen.getByText('NÚMERO')).toBeDefined()
    expect(screen.getByText('ALIAS (ITEM)')).toBeDefined()
    expect(screen.getByText(`${enabledKeys.length} de ${enabledKeys.length} columnas seleccionadas`)).toBeDefined()
    const checkboxes = screen.getAllByRole('checkbox')
    const checked = checkboxes.filter(cb => (cb as HTMLInputElement).checked)
    const disabled = checkboxes.filter(cb => (cb as HTMLInputElement).disabled)
    expect(checked).toHaveLength(enabledKeys.length)
    expect(disabled).toHaveLength(SALES_REPORT_COLUMNS.length - enabledKeys.length)
  })

  it('las columnas deshabilitadas no se pueden marcar', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    const alias = screen.getAllByRole('checkbox').find(cb => (cb as HTMLInputElement).disabled) as HTMLInputElement
    await user.click(alias)
    expect(alias.checked).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }))
    expect(props.onConfirm).toHaveBeenCalledWith(enabledKeys)
  })

  it('descargar envía las columnas seleccionadas', () => {
    const { props } = renderModal()
    fireEvent.click(screen.getByText('NÚMERO').closest('label') as HTMLElement)
    fireEvent.click(screen.getByText('FECHA').closest('label') as HTMLElement)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }))
    expect(props.onConfirm).toHaveBeenCalledWith(enabledKeys.filter(k => k !== 'numero' && k !== 'fecha'))
  })

  it('seleccionar todo y quitar todo', () => {
    const { props } = renderModal()
    fireEvent.click(screen.getByText('Quitar todo'))
    expect(screen.getByText(`0 de ${enabledKeys.length} columnas seleccionadas`)).toBeDefined()
    fireEvent.click(screen.getByText('Seleccionar todo'))
    expect(screen.getByText(`${enabledKeys.length} de ${enabledKeys.length} columnas seleccionadas`)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }))
    expect(props.onConfirm).toHaveBeenCalledWith(enabledKeys)
  })

  it('cancelar y botón de cierre', () => {
    const { props } = renderModal()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(props.onCancel).toHaveBeenCalled()
  })

  it('muestra estado de generación deshabilitando la confirmación', () => {
    renderModal({ confirming: true })
    expect(screen.getByText('Generando...')).toBeDefined()
    expect((screen.getByRole('button', { name: 'Generando...' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
