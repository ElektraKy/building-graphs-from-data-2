

  
    //LABELS DEFAULT
    const defaultLabelStyle2 = new DefaultLabelStyle({
      backgroundStroke: 'black',
      backgroundFill: 'grey',
      wrapping: 'word',
      verticalTextAlignment: 'center',
      maximumSize: [120,50], //[300,50], //todo - > fill to node size
      //insets: [3, 5, 3, 5]
    })
  
    // GROUP NODES DEFAULT
    graph.groupNodeDefaults.labels.autoAdjustPreferredSize
    graph.groupNodeDefaults.labels.layoutParameter = InteriorLabelModel.NORTH  
  
    graph.groupNodeDefaults.labels.style = defaultLabelStyle2
    // NODES DEFAULT
    // set sizes and locations specific for this tutorial
    graph.nodeDefaults.labels.style = defaultLabelStyle1
