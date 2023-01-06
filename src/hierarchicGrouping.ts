import {
    CompositeLayoutData,
    FixNodeLayoutData,
    FixNodeLayoutStage,
    FixPointPolicy,
    GivenCoordinatesStage,
    GivenCoordinatesStageData,
    GraphComponent,
    GraphInputMode,
    GroupingSupport,
    HierarchicLayout,
    HierarchicLayoutData,
    HierarchicLayoutEdgeRoutingStyle,
    HierarchicLayoutRoutingStyle,
    IEdge,
    IEnumerable,
    IGraph,
    IMapper,
    INode,
    INodeInsetsProvider,
    Insets,
    IPoint,
    IRectangle,
    ISize,
    LayoutExecutor,
    LayoutMode,
    LayoutOrientation,
    List,
    Mapper,
    NodeAlignmentPolicy,
    NodeInsetsProvider,
    Point,
    Rect,
    RecursiveEdgeStyle,
    Size
  } from 'yfiles'

  
  export default class HierarchicGrouping {
    /**
     * The last group node that was collapsed/expanded.
     */
    private changedGroupNode: INode = null!
    /**
     * A mapper containing alternative bounds for the collapsed/expanded group node.
     */
    private readonly alternativeGroupBounds: Mapper<INode, IRectangle>
    /**
     * A mapper containing alternative path for the edges connecting to groups,
     * group content or folder nodes.
     */
    private readonly alternativeEdgePaths: Mapper<IEdge, List<IPoint>>
  
    constructor(private readonly graphComponent: GraphComponent) {
      this.alternativeGroupBounds = new Mapper()
      this.alternativeEdgePaths = new Mapper()
  
      this.configureInputMode(graphComponent.inputMode as GraphInputMode)
      
    }
  
    /**
     * Enables the folding commands on the `navigationInputMode` of the provided `inputMode` and
     * registers event listeners for the expand and collapse commands that trigger the automatic layout.
     *
     * @param inputMode The input mode to be configured.
     */
    private configureInputMode(inputMode: GraphInputMode): void {
      // Create an input mode and set a group node alignment policy that makes sure that the
      // expand/collapse button of the current group node keeps its location.
      // Note that the corresponding 'fix point policy' is used for the FixNodeLayoutStage in
      // the incremental layout calculation.
      const navigationInputMode = inputMode.navigationInputMode
      navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_LEFT
  
      // Allow folding commands
      navigationInputMode.allowCollapseGroup = true
      navigationInputMode.allowExpandGroup = true
  
      // FitContent interferes with our view port animation setup
      navigationInputMode.fitContentAfterGroupActions = false
  
      navigationInputMode.addGroupExpandingListener((sender, evt) =>
        this.beforeExpandingGroup(evt.item)
      )
      console.log('1')
      navigationInputMode.addGroupCollapsingListener((sender, evt) =>
        this.beforeCollapsingGroup(evt.item)
      )
      console.log('2')
      navigationInputMode.addGroupExpandedListener(async (sender, evt) =>
        await this.afterGroupStateChanged(evt.item)
      )
      console.log('3')
      navigationInputMode.addGroupCollapsedListener(async (sender, evt) =>
        await this.afterGroupStateChanged(evt.item)
      )
      console.log('4')
    }
  
    /**
     * Stores information about the layout of a group before expanding the group.
     *
     * @param group The group that will be expanded.
     */
    private beforeExpandingGroup(group: INode): void {
      console.log('inside beforeExpandingGroup')
      const edgesToBackup = (graph: IGraph, group: INode) => graph.edgesAt(group)
      this.beforeGroupStateChanged(group, edgesToBackup)
    }
  
    /**
     * Stores information about the layout of a group before collapsing the group.
     *
     * @param group The group that will be collapsed.
     */
    private beforeCollapsingGroup(group: INode): void {
      console.log('inside beforeCollapsingGroup')
      const edgesToBackup = (graph: IGraph, group: INode) => this.getAffectedEdges(graph, group)
      this.beforeGroupStateChanged(group, edgesToBackup)
    }
  
    /**
     * Stores information about the layout of a group before collapsing or expanding the group.
     *
     * @param group The group that will be collapsed or expanded.
     * @param edgesToBackup The edges whose paths should be stored as well.
     */
    private beforeGroupStateChanged(
      group: INode,
      edgesToBackup: (graph: IGraph, group: INode) => Iterable<IEdge>
    ): void {
      console.log('inside beforeGroupStateChanged')
      const graph = this.graphComponent.graph
      const foldingView = graph.foldingView!
      const layout = group.layout
  
      // store the collapsed group node
      this.changedGroupNode = group
      console.log('changed group is collapsed', group.tag.collapsed, 'is in folding state', group.tag.isInFoldingState)
  
      // store the group bounds of the collapsed group node before layout
      this.alternativeGroupBounds.clear()
      this.alternativeGroupBounds.set(foldingView.getMasterItem(group), layout.toRect())
  
      // store all edge paths that connect to/into the collapsed group before layout
      this.alternativeEdgePaths.clear()
      for (const edge of edgesToBackup(graph, group)) {
        this.alternativeEdgePaths.set(foldingView.getMasterItem(edge), getPointList(edge))
      }
    }
  
    /**
     * Performs an incremental layout on the graph after a group was closed/expanded interactively.
     *
     * @param group The group that was expanded or collapsed.
     */
    private async afterGroupStateChanged(group: INode): Promise<void> {
      console.log('inside afterGroupStateChanged')
      console.log('is in folding state', group.tag.isInFoldingState)

      // store the current locations of nodes and edges to keep them for incremental layout
      const graph = this.graphComponent.graph
      const nodesCoordinates = new Mapper<INode, IPoint>()
      const nodeSizes = new Mapper<INode, ISize>()
      const edgesCoordinates = new Mapper<IEdge, List<IPoint>>()
  
      // we store the insets for each group node as we will change the size of the nodes to
      // animate the expand operation
      const insets = new Mapper<INode, Insets>()
      for (const node of graph.nodes) {
        const insetsProvider = node.lookup(INodeInsetsProvider.$class)
        if (insetsProvider) {
          insets.set(node, insetsProvider.getInsets(node))
        }
      }
  
      const groupingSupport = graph.groupingSupport
      if (graph.isGroupNode(group)) {
        // reset the paths and the centers of the child nodes so that morphing looks smoother
        const descendants = groupingSupport.getDescendants(group)
        const visitedEdges = new Set()
        descendants.forEach(childNode => {
          graph.edgesAt(childNode).forEach(edge => {
            // store path and clear bends afterwards
            if (!visitedEdges.has(edge)) {
              edgesCoordinates.set(edge, getPointList(edge))
              graph.clearBends(edge)
              visitedEdges.add(edge)
            }
          })
          // store coordinates and center node afterwards
          const layout = childNode.layout
          nodesCoordinates.set(childNode, Point.from(layout))
          nodeSizes.set(childNode, Size.from(layout))
          graph.setNodeLayout(childNode, new Rect(group.layout.center.x, group.layout.center.y, 1, 1))
        })
      }
  
      // reset adjacent edge paths to get smoother layout transitions
      graph.edgesAt(group).forEach(edge => {
        // store path and clear bends afterwards
        edgesCoordinates.set(edge, getPointList(edge))
        graph.clearBends(edge)
      })
  
      // we register a new insets provider that holds the old insets of the group nodes, before the resizing
      const chainLink = graph.decorator.nodeDecorator.insetsProviderDecorator.setFactory(
        node => new NodeInsetsProvider(insets.get(node) ?? new Insets(0))
      )
  
      // run the incremental layout
      await this.applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates)
  
      // remove the insets provider
      graph.decorator.nodeDecorator.remove(chainLink!)
    }
  
    /**
     * Applies the incremental layout after each expanding and collapsing.
     * @param nodesCoordinates the coordinates of the nodes before the layout
     * @param nodeSizes the sizes of the nodes before the layout
     * @param edgesCoordinates the coordinates of the edges before the layout
     */
    async applyIncrementalLayout(
      nodesCoordinates: IMapper<INode, IPoint>,
      nodeSizes: IMapper<INode, ISize>,
      edgesCoordinates: IMapper<IEdge, IEnumerable<IPoint>>
    ): Promise<void> {
      // Configure hierarchic layout for a most stable outcome
      const layout = new HierarchicLayout()
      layout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
      layout.gridSpacing = 25 //this affects the distance between groups - subgroups
      //layout.minimumLayerDistance = 130
      //layout.considerNodeLabels = true
      layout.automaticEdgeGrouping = true //doesn't work with folding if I add recursiveEdgeStyle
      //layout.orthogonalRouting =  true //choose edge type of original layout (before the user moves nodes)
      layout.backLoopRouting = true
      layout.recursiveGroupLayering = true
      layout.layoutMode = LayoutMode.INCREMENTAL //this makes the edges funny

      //todo add the following if you want to avoid messing edges and  bends when moving nodes/groups
      //layout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL)

      //if I add the following then the grouping does not work...
      //layout.edgeLayoutDescriptor.recursiveEdgeStyle = RecursiveEdgeStyle.DIRECTED
  
      // The FixNodeLayoutStage is used to make sure that the expanded/collapsed group stays at their location.
      // Note that an input mode with the corresponding 'group node alignment policy' is used, too.
      const fixNodeLayout = new FixNodeLayoutStage(layout)
      fixNodeLayout.fixPointPolicy = FixPointPolicy.UPPER_LEFT
  
      // Prepare graph so the layout will consider which node is fixed and what bounds to use for from-sketch placement
      const graph = this.graphComponent.graph
      const foldingView = graph.foldingView!
      const layoutData = new CompositeLayoutData(
        new HierarchicLayoutData({
          alternativeGroupBounds: node => {
            const masterNode = foldingView.getMasterItem(node)
            return this.alternativeGroupBounds.get(masterNode)
          },
          alternativeEdgePaths: edge => {
            const masterEdge = foldingView.getMasterItem(edge)
            return this.alternativeEdgePaths.get(masterEdge)
          },
          // Mark folder nodes to treat them differently than normal nodes during layout
          folderNodes: node => !foldingView.isExpanded(node)
        }),
        new FixNodeLayoutData({
          fixedNodes: this.changedGroupNode
        }),
        new GivenCoordinatesStageData({
          nodeLocations: nodesCoordinates,
          nodeSizes: nodeSizes,
          edgePaths: edgesCoordinates
        })
      )
  
      // The GivenCoordinatesStage will move the nodes to their previous locations to be able to run an incremental
      // layout although all nodes inside a group node were placed at the same location.
      const layoutExecutor = new LayoutExecutor({
        graphComponent: this.graphComponent,
        layout: new GivenCoordinatesStage(fixNodeLayout),
        layoutData,
        easedAnimation: true,
        duration: '0.5s'
      })
      try {
        await layoutExecutor.start()
      } catch (error) {
      }
      this.graphComponent.updateContentRect()
    }
  
    /**
     * Retrieves the affected edges when a group node is collapsed.
     * Edges are affected when they connect to the group node directly or to a descendant of the group node.
     *
     * @param graph The graph to which the group node belongs.
     * @param group The group node which is collapsed.
     *
     * @return An array of all affected edges.
     */
    private getAffectedEdges(graph: IGraph, group: INode): IEdge[] {
      // Collect all edges that connect to the group node.
      const crossingEdges = graph.edgesAt(group).toArray()
  
      // Collect all edges that cross the group node's border.
      let groupingSupport: GroupingSupport = graph.groupingSupport
      if (groupingSupport === null) {
        groupingSupport = new GroupingSupport(graph)
      }
      const descendants = groupingSupport.getDescendants(group)
      const visitedEdges = new Set()
      descendants.forEach(descendant => {
        graph.edgesAt(descendant).forEach(edge => {
          if (!visitedEdges.has(edge)) {
            if (!groupingSupport.isDescendant(edge.opposite(descendant) as INode, group)) {
              crossingEdges.push(edge)
            }
            visitedEdges.add(edge)
          }
        })
      })
  
      return crossingEdges
    }
  }
  
  /**
   * Returns the control points of the given edge.
   * The control points of an edge are its source port location, its bend locations, and its target
   * port location.
   * @param edge the edge whose control points are collected.
   */
  function getPointList(edge: IEdge): List<IPoint> {
    const points = new List<IPoint>()
    points.add(edge.sourcePort!.location)
    for (const bend of edge.bends) {
      points.add(bend.location)
    }
    points.add(edge.targetPort!.location)
    return points
  }