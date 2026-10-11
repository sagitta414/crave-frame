// Verified title metadata; missing artwork uses a branded fallback.
export const titleArtwork = {
  "grand-budapest": {
    "image": "https://image.tmdb.org/t/p/w780/jK65srQczOKTpW62wPxwwKztGgE.jpg",
    "source": "https://www.themoviedb.org/movie/120467"
  },
  "chef": {
    "image": "https://image.tmdb.org/t/p/w780/igVNCpS132rOqrnDsrVYW5HCIsM.jpg",
    "source": "https://www.themoviedb.org/movie/212778"
  },
  "ratatouille": {
    "image": "https://image.tmdb.org/t/p/w780/qxGmHvmjlBlH5WZOhdHEHAjHaMB.jpg",
    "source": "https://www.themoviedb.org/movie/2062"
  },
  "paddington": {
    "image": "https://image.tmdb.org/t/p/w780/kfofK4GzJsJZhCShqZY438c8Y4Y.jpg",
    "source": "https://www.themoviedb.org/movie/116149"
  },
  "before-sunrise": {
    "image": "https://image.tmdb.org/t/p/w780/qA2TyqPldTtoTVY3LKrNIG5g6bH.jpg",
    "source": "https://www.themoviedb.org/movie/76"
  }
};
export function tmdbImage(path){return typeof path==='string'&&/^\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(path)?'https://image.tmdb.org/t/p/w500'+path:null;}
export function artworkFor(show){
 const image=tmdbImage(show?.backdropPath)||tmdbImage(show?.posterPath);
 return image&&show?.provider?{image,source:show.source}:titleArtwork[show?.id]||null;
}
