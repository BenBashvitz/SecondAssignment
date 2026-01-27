import Movie from "../types/movie";

export const MOVIES: Omit<Movie, "createdBy">[] = [
  { title: "inception", releaseYear: 2010 },
  { title: "inception2", releaseYear: 2015 },
];
