const { REACT_APP_MAPBOX_ACCESS_TOKEN } = process.env;

export default {
  style: 'mapbox://styles/mongabay/cmktmslps004z01se8n68atf5',
 
  accessToken: REACT_APP_MAPBOX_ACCESS_TOKEN,
 
  theme: 'mongabay',

  intro: {
    title: 'Deep sea mining',
    subtitle: "Tracking china vessels.",
    date: 'February 2, 2026',

   social: [
      {
        name: 'X',
        src: 'x.svg',
        href: 'https://x.com/mongabay',
      },
      {
        name: 'facebook',
        src: 'facebook.svg',
        href: 'https://www.facebook.com/mongabay/',
      },
    ],
  },
  logos: [
    {
      name: 'mongabay',
      src: 'mongabaylogo.png',
      width: '140',
      href: 'https://news.mongabay.com',
    },
  ],
  alignment: 'left',
  footer: 'Text by Elizabeth Alberts | Visualization by Andrés Alegría',
 
  // Chapter camera behavior
  //
  // Per chapter you can set:
  //   mapAnimation: 'flyTo' | 'easeTo' | 'jumpTo'
  //
  // The camera method is applied to the chapter.location object.
  // If omitted, it defaults to 'flyTo'.
  //
  // Track animation note:
  // If you use onChapterEnter -> { callback: 'trackAnimation.start', options: { camera: ... } }
  // and camera is NOT 'chapter', the chapter system will *not* move the camera (to avoid conflicts).



  chapters: [


// Visual04: Types of deep-sea mineral deposits

// Visual05: Environmental consequences

// Visual06: Overall activity/additional missions of the vessels

// Visual07: Pathway of the Haiyang Dizhi Liuhao 

// Visual08: Pathway of the Xiang Yang Hong 6

// Visual09: Pathway of other vessels

// Visual11: BOEM


/////////////////////////////////////////////////////////////

// Visual01: Pathway of the Xiang Yang Hang 01
{
  id: "Visual01",
  alignment: 'left',

  title: 'Visual01',
  description: "Pathway of the Xiang Yang Hang 01.",

  location: { center: [150.0, 17.15], zoom: 3.25, pitch: 0, bearing: 0 },
  
  legend: [
        {
          title: 'Exploration Areas',
          color: '#e66d6d',
          border: '#f6bcb3',
        },
        {
          title: 'Reserve Areas',
          color: '#006a54',
        },
         ],
  
  onChapterEnter: [
    {
      callback: "trackAnimation.start",
      options: {
      vesselFile: "/data/tracks/Xiang_Yang_Hong01_track_June2025.geojson", 
      speed: 5,
      }
    }
  ],
  onChapterExit: [
    { callback: "trackAnimation.resume" },
  ]
},


// Visual02: Eight vessels


{
  id: "Visual02",
  type: "stage",
  stage: "GalleryHorizontalScroll",
},

// Visual03: ISA contract areas

  {
      id: 'Visual03',
      alignment: 'fully',
      hidden: false,
      title: 'Visual03',
      description: "ISA contract areas.",
       
      location: {
        center: [-56.542931, -10.519600],
        zoom: 1.25,
        pitch: 0,
        bearing: 0,
      },

legend: [
        {
          title: 'Exploration Areas',
          color: '#e66d6d',
          border: '#f6bcb3',
        },
        {
          title: 'Reserve Areas',
          color: '#006a54',
        },
         ],
      
      mapAnimation: 'flyTo',
      rotateAnimation: false,
      onChapterEnter: [      ],
      onChapterExit: [      ],
    },






// Visual10: Pathways around the Cook Islands

// Visual10a: Nautilus

{
  id: "Visual10a",
  alignment: 'right',

  title: 'Visual10a',
  description: "Pathways around the Cook Islands. Nautilus",

  location: { center: [-158.067, -18.252], zoom: 4.2, pitch: 0, bearing: 0 },
  
  onChapterEnter: [
    {
      callback: "trackAnimation.start",
      options: {
      vesselFile: "/data/tracks/EVNautilus.geojson", 
      speed: 75,
      flyToStart: false,
      }
    }
    
  ],
  onChapterExit: [
    { callback: "trackAnimation.resume" },
  ]
},


// Visual10b: Da Yang Hao

{
  id: "Visual10b",
  alignment: 'right',

  title: 'Visual10b',
  description: "Pathways around the Cook Islands. Da Yang Hao",

  location: { center: [-158.067, -18.252], zoom: 4.2, pitch: 0, bearing: 0 },
  
  onChapterEnter: [
    {
      callback: "trackAnimation.start",
      options: {
      vesselFile: "/data/tracks/Da_Yang_Hao_track_Cook_Isl.geojson", 
      speed: 1,
      flyToStart: false,
      }
    }
    
  ],
  onChapterExit: [
    { callback: "trackAnimation.resume" },
  ]
},


  ],
};
