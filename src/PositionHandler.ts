/****************************************************************************
** @license
**
***************************************************************************/
import {
    BaseClass,
    IInputModeContext,
    IPositionHandler,
    MutablePoint,
    MutableRectangle,
    Point
  } from 'yfiles'
  
  /**
   * An {@link IPositionHandler} that manages the position of a given {@link MutableRectangle}.
   */
  export default class PositionHandler extends BaseClass(IPositionHandler) {
    /**
     * Stores the offset from the mouse event location to the handled rectangle's upper left corner.
     */
    private offset: MutablePoint = new MutablePoint()
  
    constructor(private rectangle: MutableRectangle) {
      super()
    }
  
    /**
     * The rectangle's top-left coordinate.
     */
    get location(): Point {
      return this.rectangle.topLeft
    }
  
    /**
     * Initializes the mouse event offset before the actual move gesture starts.
     */
    initializeDrag(context: IInputModeContext): void {
      const x = this.rectangle.x - context.canvasComponent!.lastEventLocation.x
      const y = this.rectangle.y - context.canvasComponent!.lastEventLocation.y
      this.offset.relocate(x, y)
    }
  
    /**
     * Updates the rectangle's position during each drag.
     */
    handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
      const newX = newLocation.x + this.offset.x
      const newY = newLocation.y + this.offset.y
      this.rectangle.relocate(new Point(newX, newY))
    }
  
    /**
     * Resets the rectangle's position when the move gesture was cancelled.
     */
    cancelDrag(context: IInputModeContext, originalLocation: Point): void {
      this.rectangle.relocate(originalLocation)
    }
  
    /**
     * Finalizes the rectangle's position when the move gesture ends.
     */
    dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
      const newX = newLocation.x + this.offset.x
      const newY = newLocation.y + this.offset.y
      this.rectangle.relocate(new Point(newX, newY))
    }
  }