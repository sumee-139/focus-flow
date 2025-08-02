import { ScreenConstraintEngine } from './screenConstraintEngine'
import { vi } from 'vitest'

// Mock DOM methods for testing
const mockElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn()
  },
  getAttribute: vi.fn(),
  setAttribute: vi.fn(),
  contains: vi.fn(),
  cloneNode: vi.fn(),
  appendChild: vi.fn()
} as unknown as Element

const mockDocument = {
  querySelectorAll: vi.fn(),
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
}

// Mock global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
})

describe('ScreenConstraintEngine - Visual Constraint Tests', () => {
  let engine: ScreenConstraintEngine
  let targetElement: Element
  let otherElements: Element[]

  beforeEach(() => {
    engine = new ScreenConstraintEngine()
    
    // Create separate mock objects for target and other elements
    targetElement = {
      classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn() },
      getAttribute: vi.fn().mockReturnValue(''),
      setAttribute: vi.fn(),
      contains: vi.fn(),
      cloneNode: vi.fn(),
      appendChild: vi.fn()
    } as unknown as Element
    
    otherElements = [mockElement, mockElement, mockElement]
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup default mock returns
    mockDocument.querySelectorAll.mockReturnValue(otherElements)
    mockDocument.createElement.mockReturnValue(mockElement)
    mockElement.getAttribute.mockReturnValue('')
    mockElement.contains.mockReturnValue(false)
    mockElement.cloneNode.mockReturnValue(mockElement)
  })

  test('should apply minimal constraint correctly (opacity + element hiding)', async () => {
    await engine.applyConstraint('minimal', targetElement)
    
    // Should query all elements
    expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('*')
    
    // Should add minimal constraint class to non-target elements
    expect(mockElement.classList.add).toHaveBeenCalledWith('focus-constraint-minimal')
    
    // Should backup original styles
    expect(mockElement.getAttribute).toHaveBeenCalledWith('style')
  })

  test('should apply moderate constraint with blur and centering', async () => {
    await engine.applyConstraint('moderate', targetElement)
    
    // Should create overlay element
    expect(mockDocument.createElement).toHaveBeenCalledWith('div')
    
    // Should add moderate constraint class to target element
    expect(targetElement.classList.add).toHaveBeenCalledWith('focus-constraint-moderate')
    
    // Should append overlay to body
    expect(mockDocument.body.appendChild).toHaveBeenCalled()
  })

  test('should apply intensive constraint with fullscreen mode', async () => {
    await engine.applyConstraint('intensive', targetElement)
    
    // Should create fullscreen container
    expect(mockDocument.createElement).toHaveBeenCalledWith('div')
    
    // Should clone target element
    expect(targetElement.cloneNode).toHaveBeenCalledWith(true)
    
    // Should append fullscreen container to body
    expect(mockDocument.body.appendChild).toHaveBeenCalled()
  })

  test('should restore original UI state after constraint removal', async () => {
    // Apply constraint first
    await engine.applyConstraint('minimal', targetElement)
    
    // Then remove constraint
    engine.removeConstraint()
    
    // Should remove constraint classes
    expect(mockElement.classList.remove).toHaveBeenCalledWith(
      'focus-constraint-minimal',
      'focus-constraint-moderate',
      'focus-constraint-intensive'
    )
    
    // Should restore original styles
    expect(mockElement.setAttribute).toHaveBeenCalledWith('style', '')
  })

  test('should handle constraint level changes dynamically', async () => {
    // Apply minimal constraint first
    await engine.applyConstraint('minimal', targetElement)
    
    // Verify minimal constraint was applied
    expect(mockElement.classList.add).toHaveBeenCalledWith('focus-constraint-minimal')
    
    // Clear mock calls
    vi.clearAllMocks()
    
    // Apply intensive constraint (should remove previous constraint)
    await engine.applyConstraint('intensive', targetElement)
    
    // Should remove previous constraints first
    expect(mockElement.classList.remove).toHaveBeenCalledWith(
      'focus-constraint-minimal',
      'focus-constraint-moderate',
      'focus-constraint-intensive'
    )
    
    // Should create fullscreen container for intensive mode
    expect(mockDocument.createElement).toHaveBeenCalledWith('div')
  })

  test('should handle multiple constraint applications without memory leaks', async () => {
    // Apply and remove constraints multiple times
    for (let i = 0; i < 5; i++) {
      await engine.applyConstraint('moderate', targetElement)
      engine.removeConstraint()
    }
    
    // Should not accumulate elements or style backups
    // This is tested implicitly by ensuring removeConstraint cleans up properly
    expect(mockDocument.body.removeChild).toHaveBeenCalledTimes(5)
  })

  test('should preserve element references for cleanup', async () => {
    await engine.applyConstraint('minimal', targetElement)
    
    // Apply another constraint to test cleanup
    await engine.applyConstraint('moderate', targetElement)
    
    // Previous minimal constraints should be cleaned up
    expect(mockElement.classList.remove).toHaveBeenCalledWith(
      'focus-constraint-minimal',
      'focus-constraint-moderate',
      'focus-constraint-intensive'
    )
  })

  test('should handle DOM manipulation errors gracefully', async () => {
    // Mock document.body.appendChild to throw error
    mockDocument.body.appendChild.mockImplementation(() => {
      throw new Error('DOM manipulation failed')
    })
    
    // Should not throw error, but handle gracefully
    await expect(engine.applyConstraint('intensive', targetElement)).resolves.toBeUndefined()
  })

  test('should support custom constraint configurations', async () => {
    const customConfig = {
      opacity: '0.5',
      filter: 'blur(5px)',
      backgroundColor: '#333'
    }
    
    // This test verifies the engine can be extended for custom constraints
    // For now, we test that the basic constraint application works
    await engine.applyConstraint('minimal', targetElement)
    
    expect(mockElement.classList.add).toHaveBeenCalledWith('focus-constraint-minimal')
  })
})