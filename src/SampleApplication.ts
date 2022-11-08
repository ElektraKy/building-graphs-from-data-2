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
  //GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  ICommand,
  IEdge,
  IGraph,
  INode,
  License,
  Point,
  RectangleNodeStyle,
  Size,
  LayoutExecutor,
  LayoutOrientation,
  Class,
  //Color,
  //FontWeight,
  TextWrapping,
  GraphViewerInputMode,
  InteriorLabelModel,
  LabelStyleBase,
  TemplateLabelStyle,
  LabelsSource,
  //INodeSizeConstraintProvider,
  //ILabel,
  //LabelAngleOnRightSideOffsets,
  //LabelDefaults
} from 'yfiles'

import { bindAction, bindCommand, showApp } from './demo-app/demo-app'
import { applyDemoTheme, initDemoStyles } from './demo-app/demo-styles'
import { fetchLicense } from './demo-app/fetch-license'
//import { ViewBridgeLayout } from 'yfiles/view-layout-bridge'
import {HierarchicLayout} from 'yfiles/layout-hierarchic'

let graphComponent: GraphComponent



/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  //applyDemoTheme(graphComponent)

  //determine the mode for the user (interactions allowed)
  //see here https://docs.yworks.com/yfiles-html/api/GraphEditorInputMode.html
  //and here https://docs.yworks.com/yfiles-html/dguide/interaction/interaction-support.html
  //graphComponent.inputMode = new GraphEditorInputMode({
  //  allowGroupingOperations: false
  //})
  
  graphComponent.inputMode = new GraphViewerInputMode() 

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  try {

    // *****OPTION 1: FOR SPARQL OUTPUTS ******
    // for SPARQL outputs only: load the graph data from the given JSON files - 
    const nodesData1 = await loadJSON('./nodesource.json')
    const groupsData1 = await loadJSON('./groupsource.json')
    const edgesData = await loadJSON('./edgesource.json')
    // replace all @id with id and first @graph instance with graph
    const nodes_str = JSON.stringify(nodesData1).replace(/@id/g, 'id').replace('@graph','graph')
    const nodesData = JSON.parse(nodes_str);
    const groups_str = JSON.stringify(groupsData1).replace(/@id/g, 'id').replace('@graph','graph')
    const groupsData = JSON.parse(groups_str);

    // then build the graph with the given data set using the Sparql-formatted json files
    buildGraph_fromSparql(graphComponent.graph, nodesData, groupsData, edgesData) // use the adjusted buildGraph that reads 3 individual Sparql-formatted json files
    // *************END OF OPTION 1**********
    
    // *****OPTION 2: WHEN USING A SINGLE JSON FILE FOR ALL THE DATA********
    //const graphData = await loadJSON('./GraphData.json')
    //uildGraph(graphComponent.graph, graphData) //use this for a single json
    // *************END OF OPTION 2**********
    
    graphComponent.fitGraphBounds()

    // APPLY THE LAYOUT
    const customLayout = new HierarchicLayout()
    // Use left-to-right main layout direction.
    customLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
    customLayout.gridSpacing = 25 //this affects the distance between groups - subgroups
    customLayout.minimumLayerDistance = 130
    customLayout.considerNodeLabels = true
  
    graphComponent.morphLayout(customLayout, '1s');

    // LOAD INFORMATION FOR CLICKABLE ITEMS
    (graphComponent.inputMode as GraphViewerInputMode)!.addItemClickedListener(
      (sender, args): void => {
        const node = args.item.tag
        if (node.type.indexOf('collibra:BusinessDataElement') !== -1)
          {console.log("Node clicked", sender, " args", node.label, node.type, node.bde_prop1, node.bde_prop2)}
        else if (node.type.indexOf('collibra:ReportDataElement') !== -1)
          {console.log("Node clicked", sender, " args", node.label, node.type, node.rde_prop1, node.rde_prop2)}
        //do the same for group nodes - todo
      // this.setState({ showFilters: true})
      // this.onNodeClicked(args.item);
    })

    // Finally, enable the undo engine. This prevents undoing of the graph creation
    graphComponent.graph.undoEngineEnabled = true
  } catch (e) {
    alert(e)
  }

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * How to iterate through the data set and which information are applied to the graph, depends on the structure of
 * the input data. However, the general approach is always the same, i.e. iterating through the data set and
 * calling the graph item factory methods like
 * {@link IGraph.createNode()},
 * {@link IGraph.createGroupNode()},
 * {@link IGraph.createEdge()},
 * {@link IGraph.addLabel()}
 * and other {@link IGraph} functions to apply the given information to the graph model.
 *
 * @param graph The graph.
 * @param graphData The graph data that was loaded from the JSON file.
 * @yjs:keep=groupsSource,nodesSource,edgesSource
 */




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
  
    // If given, apply the edge layout information
    graph.edges.forEach((edge: IEdge): void => {
      const edgeData = edge.tag
      if (edgeData.sourcePort) {
        graph.setPortLocation(edge.sourcePort!, Point.from(edgeData.sourcePort))
      }
      if (edgeData.targetPort) {
        graph.setPortLocation(edge.targetPort!, Point.from(edgeData.targetPort))
      }
      if (edgeData.bends) {
        edgeData.bends.forEach((bendLocation: Point): void => {
          graph.addBend(edge, bendLocation)
        })
      }
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
 function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // GROUP NODES DEFAULT
  graph.groupNodeDefaults.style = new GroupNodeStyle({
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
//  ------------------------------------------------------  // 

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", (): void => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
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
