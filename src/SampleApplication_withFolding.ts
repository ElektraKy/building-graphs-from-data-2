/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.0.2.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GraphOverviewComponent,
  GroupNodeStyle,
  ICommand,
  //IEdge,
  IGraph,
  INode,
  //IPoint,
  License,
  Point,
  RectangleNodeStyle,
  Size,
  LayoutExecutor,
  LayoutMode,
  LayoutOrientation,
  MoveViewportInputMode,
  Class,
  //Color,
  //FontWeight,
  //ShapeNodeStyle,
  DefaultFolderNodeConverter,
  //TextWrapping,
  GraphViewerInputMode,
  //InteriorLabelModel,
  //LabelStyleBase,
  //TemplateLabelStyle,
  //LabelsSource,
  OrthogonalEdgeEditingContext,
  //GraphSnapContext,
  GraphItemTypes,
  FoldingManager,
  MergingFoldingEdgeConverter,
  PolylineEdgeStyle,
  //ArrowEdgeStyle,
  HierarchicLayout,
  HierarchicLayoutRoutingStyle,
  HierarchicLayoutEdgeRoutingStyle,
  RecursiveEdgeStyle,
  BridgeEdgeStyle,
  //PanelNodeStyle,
  CollapsibleNodeStyleDecorator,
  //GraphBuilder,
  //TemporaryGroupNodeInsertionData,
 //NodeStyleDecorationInstaller
  //INodeSizeConstraintProvider,
  //ILabel,
  //LabelAngleOnRightSideOffsets,
  //LabelDefaults
} from 'yfiles'
import HierarchicGrouping from './hierarchicGrouping'
import { bindAction, bindCommand, showApp } from './demo-app/demo-app'
import { initDemoStyles, DemoStyleOverviewPaintable } from './demo-app/demo-styles'

import { fetchLicense } from './demo-app/fetch-license'
//import { ViewBridgeLayout } from 'yfiles/view-layout-bridge'
//import {HierarchicLayout} from 'yfiles/layout-hierarchic'


let graphComponent: GraphComponent = null!

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  //applyDemoTheme(graphComponent)
  const overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent
  // initialize input mode

  graphComponent.inputMode = new MoveViewportInputMode()
  graphComponent.inputMode = new GraphViewerInputMode({clickableItems: GraphItemTypes.NODE})
  //const moveViewportInputMode = mode.moveViewportInputMode
  //determine the mode for the user (interactions allowed)
  //see here https://docs.yworks.com/yfiles-html/api/GraphEditorInputMode.html
  //and here https://docs.yworks.com/yfiles-html/dguide/interaction/interaction-support.html
  //graphComponent.inputMode = new GraphEditorInputMode({
    //create elements
    //allowCreateNode: false,
    //allowCreateEdge: false,
    //allowCreateBend: false, //when moving nodes, bends can become really messy - so it would be good to allow users to modify them
    //allowAddLabel: false,
    //delete elements
    //deletableItems: GraphItemTypes.NONE, //'none',
    //edit labels
    //allowEditLabelOnDoubleClick: false, 
    //allowEditLabel: false,
    //enable orthogonal edge editing
    //orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(), // when nodes are moved, edges bend based on orthogonal layout
    //enable snapping for edges only -- this adds the blue lines and 'X's when edges are aligned
    //snapContext: new GraphSnapContext({
    //  collectNodeSnapLines: false,
    //  collectNodePairCenterSnapLines: false,
    //  collectNodePairSnapLines: false,
    //  collectNodePairSegmentSnapLines: false,
    //  collectNodeSizes: false,
    //  snapNodesToSnapLines: false,
    //  snapOrthogonalMovement: false
    //}),
    //other
    //allowGroupingOperations: false,
    //allowAdjustGroupNodeSize: false, //doesn't work - I am still able to resize groups and nodes
    //allowClipboardOperations: false
  //})

  
  try{
  // set up the HierarchicGrouping
  new HierarchicGrouping(graphComponent) //sosara
  }
  catch (e) {
    alert(e)
  }
  
  // *****OPTION 1: FOR SPARQL OUTPUTS ******
  // for SPARQL outputs only: load the graph data from the given JSON files - 
  //const nodesData1 = await loadJSON('./nodesource.json')
  //const groupsData1 = await loadJSON('./groupsource.json')
  //const edgesData = await loadJSON('./edgesource.json')
  const nodesData1 = await loadJSON('./nodes3_new.json')
  const groupsData1 = await loadJSON('./groups3.json')
  const edgesData = await loadJSON('./edges3.json')
  // replace all @id with id and first @graph instance with graph
  const nodes_str = JSON.stringify(nodesData1).replace(/@id/g, 'id').replace('@graph','graph')
  const nodesData = JSON.parse(nodes_str);
  const groups_str = JSON.stringify(groupsData1).replace(/@id/g, 'id').replace('@graph','graph')
  const groupsData = JSON.parse(groups_str);

  // then build the graph with the given data set using the Sparql-formatted json files
    // use the adjusted buildGraph that reads 3 individual Sparql-formatted json files
  // *************END OF OPTION 1**********
  
  // *****OPTION 2: WHEN USING A SINGLE JSON FILE FOR ALL THE DATA********
  //const graphData = await loadJSON('./GraphData.json')
  //buildGraph(graphComponent.graph, graphData) //use this for a single json
  // *************END OF OPTION 2**********

  // ENABLE FOLDING
  // first create the folding manager
  const foldingManager = new FoldingManager()//masterGraph goes here


  //ALTERNATIVE 
  //const masterGraph = new DefaultGraph()
  //const foldingManager = new FoldingManager(masterGraph)
  //END OF ALTERNATIVE

  // create the folding view with the manager
  const foldingView = foldingManager.createFoldingView()

  // each view contains a folding-enabled graph, the view graph
  const viewGraph = foldingView.graph
  // the view graph is the graph to display
  graphComponent.graph = viewGraph

    // styling the overviewComponent
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graphComponent.graph)

  // Assign the default demo styles - configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph, {foldingEnabled: true})


  //const viewGraph = graphComponent.graph
  // get the folding view from the graph
  //const foldingView = viewGraph.foldingView
  // note: foldingView.graph === viewGraph
  // get the manager from the view graph
  //const manager = foldingView.manager
  // get the master graph from the manager
  //const masterGraph = manager.masterGraph

  // set style of folders
  foldingManager.folderNodeConverter = new DefaultFolderNodeConverter({
    copyFirstLabel: true,
  //  folderNodeStyle: new ShapeNodeStyle({ fill: 'yellow' }),
    folderNodeSize: [110,60]      
  })

  //convert edges for folders
  foldingManager.foldingEdgeConverter = new MergingFoldingEdgeConverter({
    copyFirstLabel: true,
    foldingEdgeStyle: new PolylineEdgeStyle({ stroke: 'black', targetArrow: 'delta' })
    //foldingEdgeStyle: new BridgeEdgeStyle //ArrowEdgeStyle //explore all options for edge styles here: https://docs.yworks.com/yfiles-html/dguide/styles/styles-edge_styles.html
  })

  build_folding(graphComponent.graph, nodesData, groupsData, edgesData)
  centerAtTop()
  
  // Create the builder on the master graph
  //const foldingView = graph.foldingView!
  //buildGraph_fromSparql(foldingView.manager.masterGraph, nodesData, groupsData, edgesData)

  // Build the master graph from the data
  //builder.buildGraph_fromSparql(graph, nodesData, groupsData, edgesData)



  /////////////////////////////////////////////////////
  // create the graph
  //without folding
  //buildGraph_fromSparql(graphComponent.graph, nodesData, groupsData, edgesData)
  //with folding
  //buildGraph_fromSparql(foldingView.manager.masterGraph, nodesData, groupsData, edgesData)
  
  

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  foldingView.manager.masterGraph.undoEngineEnabled = true

  // APPLY THE LAYOUT
  //const customLayout = new HierarchicLayout()
  //customLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  //customLayout.gridSpacing = 25 //this affects the distance between groups - subgroups
  //customLayout.minimumLayerDistance = 130
  //customLayout.considerNodeLabels = true
  //customLayout.automaticEdgeGrouping = true //doesn't work with folding
  //customLayout.orthogonalRouting =  true //choose edge type of original layout (before the user moves nodes)
  //customLayout.backLoopRouting = true
  //customLayout.recursiveGroupLayering = true

  //graphComponent.morphLayout(customLayout, '1s');
  //new HierarchicGrouping(graphComponent)
  
  
  //to allow edge bends automatically adjust when moving nodes/groups
  //registerOrthogonalEdgeHelperDecorators(graphComponent.graph)


  try{
  
  // LOAD INFORMATION FOR CLICKABLE ITEMS
  (graphComponent.inputMode as GraphViewerInputMode)!.addItemDoubleClickedListener(
    (sender, args): void => {
      const node = args.item.tag
      
      if (node.type.indexOf('collibra:BusinessDataElement') !== -1)
        {console.log("Node clicked", sender, "Label:", node.label, '\n', "Collapsed:", node.collapsed, '\n', "Type:", node.type, '\n', "Description:", node.dataElementDescription)}
      else if (node.type.indexOf('collibra:ReportDataElement') !== -1)
        {console.log("Node clicked", sender, "Label:", node.label, '\n', "Collapsed:", node.collapsed, '\n', "Type:", node.type, '\n', "Description:", node.dataElementDescription)}
      else if (node.type.indexOf('casewise:BusinessProcess') !== -1)
        {console.log("Node clicked", sender, "Label:", node.label, '\n', "Collapsed:", node.collapsed, '\n', "Type:", node.type, '\n', "Description:", node.businessProcessDescription, '\n', "Owner:", node.businessProcessOwner, '\n', "Scope:", node.scope)}
      else if (node.type.indexOf('eim:App_Instance') !== -1)
        {console.log("Node clicked", sender, "Label:", node.label, '\n', "Collapsed:", node.collapsed, '\n', "Type:", node.type, '\n', "Description:", node.AppDescription, '\n', "Owner:", node.AppBusinessOwner)}
      else if (node.type.indexOf('collibra:BusinessDataSet') !== -1)
        {console.log("Node clicked", sender, "Label:", node.label, '\n', "Collapsed:", node.collapsed, '\n', "Type:", node.type, '\n', "Description:", node.databaseDescription)}
      else if (node.type.indexOf('collibra:Report') !== -1)
        {console.log("Node clicked", sender, "Label:", node.label, '\n', "Collapsed:", node.collapsed, '\n', "Type:", node.type, '\n', "Description:", node.reportDescription, '\n', "Owner:", node.reportOwner)}
    //this.setState({ showFilters: true})
    //this.onNodeClicked(args.item);
    })
  }
  catch (e) {
    alert(e)
  }
  // Finally, enable the undo engine. This prevents undoing of the graph creation
  //graphComponent.graph.undoEngineEnabled = true

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  //foldingView.manager.masterGraph.undoEngineEnabled = true

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  //showApp(graphComponent)
  // initialize the demo
  showApp(graphComponent, overviewComponent)
}

function build_folding(graph: IGraph, nodesData: any, groupsData: any, edgesData: any): void{
  const foldingView = graph.foldingView!
  buildGraph_fromSparql(foldingView.manager.masterGraph, nodesData, groupsData, edgesData)

  graph.nodes.toArray().forEach(node => {
    if(node.tag.type.indexOf('collibra:BusinessDataSet') !== -1) {
      foldingView.collapse(node)
      node.tag.collapsed = true
      console.log('set to Collapsed', node.tag.label)
    }
    else node.tag.collapsed = false
  })

  graph.nodes.toArray().forEach(node => {
    if(node.tag.collapsed) {
      foldingView.collapse(node)
      console.log('Collapsed', node.tag.label)
    }
  })

  // applying  hierarchic layout with recursive edges
  const hierarchicLayout = new HierarchicLayout({
    recursiveGroupLayering: true,
    //layoutMode: LayoutMode.INCREMENTAL,
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT, //todohere it conflicts with INCREMENTAL
    automaticEdgeGrouping: true, 
    backLoopRouting: true 
  })

  //todo add the following if you want to avoid messing edges and  bends when moving nodes/groups
  //hierarchicLayout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
  //  HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
  //)

  hierarchicLayout.edgeLayoutDescriptor.recursiveEdgeStyle = RecursiveEdgeStyle.DIRECTED

  // apply a layout and move it to the top of the graph component
  graph.applyLayout(hierarchicLayout)
}

function buildGraph_fromSparql(graph: IGraph, nodesData: any, groupsData: any, edgesData: any): void {
    // Store groups and nodes to be accessible by their IDs.
    // It will be easier to assign them as parents or connect them with edges afterwards.
    const groups: {
      [id: string]: INode
    } = {}
    const nodes: {
      [id: string]: INode
    } = {}

    

    // Set the styles
    //GROUPS STYLES
    const grey_group_leftgrey = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
    grey_group_leftgrey.contentAreaFill = 'white'
    grey_group_leftgrey.tabFill = 'grey'
    grey_group_leftgrey.tabHeight = 30
    grey_group_leftgrey.tabPosition =  'left'

    const grey_group_topwhite = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
    grey_group_topwhite.contentAreaFill = 'white'
    grey_group_topwhite.tabFill = 'grey'
    grey_group_topwhite.tabHeight = 60

    const red_group = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
    red_group.contentAreaFill = '#e02020'//red
    red_group.tabFill = '#e02020' //red
    red_group.folderIcon = 'none' //no collapsing allowed
    red_group.groupIcon = 'none' //no expanding allowed

    const blue_group = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
    blue_group.contentAreaFill = '#0091FF'
    blue_group.tabFill = '#0091FF'
    blue_group.tabHeight = 50

    const white_group = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
    white_group.contentAreaFill = 'white'
    white_group.tabFill = 'white' 
    white_group.tabHeight = 80

    //NODES STYLES
    const grey_node = graph.nodeDefaults.style.clone() as RectangleNodeStyle
    grey_node.fill = '#d0d0d0' //grey

    const white_node = graph.nodeDefaults.style.clone() as RectangleNodeStyle
    white_node.fill = 'white'

    //LABELS STYLES
    const white_label = graph.groupNodeDefaults.labels.style.clone() as DefaultLabelStyle
    white_label.textFill = 'white'

    const grey_label = graph.groupNodeDefaults.labels.style.clone() as DefaultLabelStyle
    grey_label.textFill = 'grey'

    const white_on_grey_label = graph.groupNodeDefaults.labels.style.clone() as DefaultLabelStyle
    white_on_grey_label.textFill = 'white'
    white_on_grey_label.backgroundFill = 'grey'

    const grey_on_white_label = graph.groupNodeDefaults.labels.style.clone() as DefaultLabelStyle
    grey_on_white_label.textFill = 'grey'
    grey_on_white_label.backgroundFill = 'white'
  

  
  // Iterate the group data and create the according group nodes.
  groupsData.graph.forEach((groupData: any): void => {
    const group = graph.createGroupNode({
      //labels: groupData.label != null ? [groupData.label] : [], //removed this to add custom label styles
      tag: groupData
    })
    // Set style and label, based on the node type
    if (groupData.type.indexOf('casewise:BusinessProcess') !== -1) { //GREY
      //option a: set the tab fill as white and the label background fill as grey
      //graph.setStyle(group, grey_group_topwhite)
      //graph.addLabel({owner: group, text: groupData.label, style: white_on_grey_label})
      //option b: make the tab white and the text black or grey
      graph.setStyle(group, grey_group_topwhite)
      graph.addLabel({owner: group, text: groupData.label, style: grey_on_white_label})
      //option c: move the tab on the left
      //graph.setStyle(group, grey_group_leftgrey)
      //graph.addLabel({owner: group, text: groupData.label, style: white_on_grey_label})

    }
    else if (groupData.type.indexOf('eim:App_Instance')!== -1) { //BLUE
      graph.setStyle(group, blue_group)
      graph.addLabel({owner: group, text: groupData.label, style: white_label})
    }
    else if (groupData.type.indexOf('collibra:Report') !== -1) { //RED
      graph.setStyle(group, red_group)
      graph.addLabel({owner: group, text: groupData.label, style: white_label})
    }
    else if(groupData.type.indexOf('collibra:BusinessDataSet') !== -1) { //WHITE
      graph.setStyle(group, white_group)
      graph.addLabel({owner: group, text: groupData.label, style: grey_label})
    }
    groups[groupData.id] = group
  })

  // Iterate the node data and create the according nodes.
  nodesData.graph.forEach((nodeData: any): void => {
    const node = graph.createNode({
      labels: nodeData.label != null ? [nodeData.label] : [],
      tag: nodeData
    })
    // Set style, based on the node type
    if (nodeData.type.indexOf('collibra:BusinessDataElement') !== -1) {
      graph.setStyle(node, grey_node)
    }
    else if (nodeData.type.indexOf('collibra:ReportDataElement') !== -1) {
      graph.setStyle(node, white_node)
    }
    nodes[nodeData.id] = node
  })

  // Set the parent groups after all nodes/groups are created.
  graph.nodes.forEach((node: INode): void => {
    if (node.tag.group) {
      graph.setParent(node, groups[node.tag.group])
    }
  })


  // Iterate the edge data and create the according edges.
  edgesData.results.bindings.forEach((edgeData: any): void => {
    // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
    // which node is the correct source/target.
    graph.createEdge({
      source: nodes[edgeData.from.value] || groups[edgeData.from.value],
      target: nodes[edgeData.to.value] || groups[edgeData.to.value],
      labels: edgeData.label != null ? [edgeData.label] : [],
      tag: edgeData
    })
  })

  Class.ensure(LayoutExecutor);
  }

  function buildGraph(graph: IGraph, graphData: any): void {
    // Store groups and nodes to be accessible by their IDs.
    // It will be easier to assign them as parents or connect them with edges afterwards.
    const groups: {
      [id: string]: INode
    } = {}
    const nodes: {
      [id: string]: INode
    } = {}
  
      // Set the styles
      const grey_group = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
      grey_group.contentAreaFill = 'white'
      grey_group.tabFill = 'grey'
  
      const red_group = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
      red_group.contentAreaFill = '#e02020'//red
      red_group.tabFill = '#e02020' //red
  
      const blue_group = graph.groupNodeDefaults.style.clone() as GroupNodeStyle
      blue_group.contentAreaFill = '#fff' //blue
      blue_group.tabFill = '#fff' //blue
  
      const grey_node = graph.nodeDefaults.style.clone() as RectangleNodeStyle
      grey_node.fill = '#d0d0d0' //grey
  
      const white_node = graph.nodeDefaults.style.clone() as RectangleNodeStyle
      white_node.fill = 'white'

      const white_label = graph.groupNodeDefaults.labels.style.clone() as DefaultLabelStyle
      white_label.textFill = 'white' //hereee
  
  
    // Iterate the group data and create the according group nodes.
    graphData.groupsSource.forEach((groupData: any): void => {
      const group = graph.createGroupNode({
        labels: groupData.label != null ? [groupData.label] : [],
        tag: groupData
      })
      // Set style, based on the node type
      if (groupData.type.indexOf('casewise:BusinessProcess') !== -1) {
        graph.setStyle(group, grey_group)
      }
      else if (groupData.type.indexOf('collibra:Report') !== -1) {
        graph.setStyle(group, red_group)
      }
      else if(groupData.type.indexOf('collibra:BusinessDataSet') !== -1) {
        graph.setStyle(group, blue_group)
      }
      groups[groupData.id] = group
    })

  
    // Iterate the node data and create the according nodes.
    graphData.nodesSource.forEach((nodeData: any): void => {
      const node = graph.createNode({
        labels: nodeData.label != null ? [nodeData.label] : [],
        tag: nodeData
      })
      // Set style, based on the node type
      if (nodeData.type.indexOf('collibra:BusinessDataElement') !== -1) {
        graph.setStyle(node, grey_node)
      }
      else if (nodeData.type.indexOf('collibra:ReportDataElement') !== -1) {
        graph.setStyle(node, white_node)
      }
      nodes[nodeData.id] = node
    })
  
    // Set the parent groups after all nodes/groups are created.
    graph.nodes.forEach((node: INode): void => {
      if (node.tag.group) {
        graph.setParent(node, groups[node.tag.group])
      }
    })
  
    // Iterate the edge data and create the according edges.
    graphData.edgesSource.forEach((edgeData: any): void => {
      // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
      // which node is the correct source/target.
      graph.createEdge({
        source: nodes[edgeData.from] || groups[edgeData.from],
        target: nodes[edgeData.to] || groups[edgeData.to],
        labels: edgeData.label != null ? [edgeData.label] : [],
        tag: edgeData
      })
    })
  
  
    Class.ensure(LayoutExecutor);
  }
//  ------------------------------------------------------  // 

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */


//  ------------------------------------------------------  // 
/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
 function initTutorialDefaults(graph: IGraph, {
  foldingEnabled = true
}: {
  foldingEnabled?: boolean
}): void{

  // set styles that are the same for all tutorials
  initDemoStyles(graph, { foldingEnabled: true })

  // GROUP NODES DEFAULT
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    groupIcon: foldingEnabled ? 'minus' : 'none',
    folderIcon: 'plus',
    cornerRadius: 0,
    tabPosition: 'top', //left is interesting as well
    drawShadow: false,
    contentAreaFill: '#0091ff',
    tabFill: '#0091ff',
    tabHeight: 90, //sos - this affects the wrapping
    //tabInset: 6 //this affects the wrapping
    //contentAreaInsets: [30,30]
  })

  // GROUP NODES LABELS DEFAULT
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: 'black',
    textSize: 15,
    wrapping: 'word-ellipsis', //TextWrapping.WORD_ELLIPSIS, 
    shape: 'rectangle',
    minimumSize: [80,10],
    //maximumSize: [10, 10000], //width,height
    textWrappingShape: 'rectangle',
    insets: [5, 8, 5, 8] //this affects the wrapping
    //The insets ensure that the upper area containing the handle is not overlapped by the content of the group.
  })

  graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createDefaultParameter() //Creates a parameter that places labels inside the tab area of a GroupNodeStyle instance.
  
  // set sizes for nodes and groups
  graph.nodeDefaults.size = new Size(100, 80)
  graph.groupNodeDefaults.size = new Size(130, 150)

  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 10,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Fits the graph into the component and moves it to the top.
 */
function centerAtTop(): void {
  // first fit the graph bounds
  graphComponent.fitGraphBounds()

  // then move the graph upwards
  const viewport = graphComponent.viewport
  const contentRect = graphComponent.contentRect
  graphComponent.viewPoint = new Point(viewport.x, contentRect.y - 20)
  graphComponent.invalidate()
}

//  ------------------------------------------------------  // 

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  //bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindAction("button[data-command='FitContent']", centerAtTop)
}

/**
 * Returns a promise that resolves when the JSON file is loaded.
 * In general, this can load other files, like plain text files or CSV files, too. However,
 * before usage you need to parse the file content which is done by JSON.parse in case of a JSON file as
 * demonstrated here.
 *
 * @param url The URL to load.
 *
 * @return A promise with the loaded data.
 */

async function loadJSON(url: string): Promise<JSON> {
  const response = await fetch(url)
  return response.json()
}


// noinspection JSIgnoredPromiseFromCall
run()
