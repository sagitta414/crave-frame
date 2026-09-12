// Source provenance: TITLE-ART-SOURCES.md
export const titleArtwork = {
  "grand-budapest": {
    "image": "/app/images/manor.png",
    "source": "https://tv.apple.com/us/movie/the-grand-budapest-hotel/umc.cmc.1yrchfyt6pyg3g827zdo6br38"
  },
  "detectorists": {
    "image": "/app/images/manor.png",
    "source": "https://tv.apple.com/us/show/detectorists/umc.cmc.38iqc9rcb5f78oliz7tv5gx5j"
  },
  "only-murders": {
    "image": "/app/images/manor.png",
    "source": "https://tv.apple.com/us/show/only-murders-in-the-building/umc.cmc.7kd9yvyu5ecz1snkt4a35o12g"
  },
  "chef": {
    "image": "/app/images/manor.png",
    "source": "https://tv.apple.com/us/movie/chef/umc.cmc.sbnir5fu1zxi3agh2u6yi1zn"
  },
  "ratatouille": {
    "image": "/app/images/manor.png",
    "source": "https://www.disneyplus.com/browse/entity-ab7c4e29-04f1-46dd-931a-d43be1ce0f8c"
  },
  "paddington": {
    "image": "/app/images/manor.png",
    "source": "https://tv.apple.com/gb/movie/paddington/umc.cmc.759zk34s47omthqjyvc9i6pgo"
  },
  "before-sunrise": {
    "image": "/app/images/manor.png",
    "source": "https://tv.apple.com/us/movie/before-sunrise/umc.cmc.65m3n3lrca1e6nljfyvhn76u0"
  }
};
export function tmdbImage(path){return typeof path==='string'&&/^\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(path)?'https://image.tmdb.org/t/p/w500'+path:null;}
export function artworkFor(show){
 const featured=titleArtwork[show?.id];if(featured)return featured;
 const image=tmdbImage(show?.backdropPath)||tmdbImage(show?.posterPath);
 return image&&show?.provider?{image,source:show.source}:null;
}
