document.addEventListener("DOMContentLoaded" , () => {
    
    const particlesContainer = document.querySelector('.bg-particles');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn') ;
    const movieResults = document.getElementById('movie-results') ;
    const API_KEY = "7485300a" ;
    
    searchButton.addEventListener("click" , () => { // Since initially I was using try/catch here so had to make arrow function async() also.
        const txtInput = searchInput.value.trim() ;
        if( !txtInput )
            return ;

        searchMovies( txtInput ) ;
    } ) ;

    searchInput.addEventListener("keydown" , ( e ) => {
        if( e.key === "Enter" ) {
            const txtInput = searchInput.value.trim() ;
            if( !txtInput )
                return ;
            
            searchMovies( txtInput ) ;
        }   
    } ) ;

    function createParticles() {
        const particleCount = 50 ;
        for ( let i = 0 ; i < particleCount ; i++ ) {
            const particle = document.createElement('div') ;
            particle.className = 'particle' ;
            particle.style.left = Math.random() * 100 + '%' ;
            particle.style.top = Math.random() * 100 + '%' ;
            particle.style.animationDelay = Math.random() * 6 + 's' ;
            particle.style.animationDuration = ( Math.random() * 3 + 4 ) + 's' ;
            particlesContainer.appendChild(particle) ;
        }
    }
    createParticles() ;

    async function searchMovies( movieName ) {
        movieResults.innerHTML =  `<div class="loading">
                                        <div class="loading-spinner"></div>
                                        <div>Searching for movies...</div>
                                    </div>` ;

        try {
            const movieURL = `https://www.omdbapi.com/?s=${movieName}&apikey=${API_KEY}` ;
            const results = await fetchMovieDetails( movieURL ) ; // Mistake also "await" for results.
            displayMovies( results.Search ) ;
        }
        catch( error ) {
            console.log( error ) ;
            movieResults.innerHTML = `
            <div class="error-msg">
                <div class="no-results-icon">🎬</div>
                <h3>No movies found</h3>
                <p>${error.message || "Try searching for a different movie title."}</p>
            </div>` ;
        }
    }
    async function fetchMovieDetails( url ) {
        const response = await fetch( url ) ;
        if( !response.ok )
            throw new Error( response.statusText || "No movies found" ) ;
        
        const data = await response.json() ;
        if( data.Response === "False" )
            throw new Error( data.Error || "No movies found" ) ;
        
        return data ;
    }

    // async function displayMovies(movies) {
    //     let details = {} ;
    //     movieResults.innerHTML = '' ;
        
    //     for ( const movie of movies ) {
    //         try {
    //             const detailsUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`;
    //             const result = await fetchMovieDetails(detailsUrl) ; // "await" can't be used with arrow forEach functions OR use Promise.all().
    //             details[ movie.imdbID ] = result ;
    //             const genreArr = result.Genre.split(", ") ;
    
    //             movieResults.innerHTML += `<div class="movie-card">
    //                                     </div>` ;
    //         } 
    //         catch ( error ) {
    //             console.error("Error fetching details for:", movie.Title, error) ;
    //             // Concatenated to not lose previous API responses.
    //             document.querySelector('.error-msg').style.gridRow = ( details.length - 1 ) / details.length ;
    //             movieResults.innerHTML += `<div class="error-msg">
    //                                         </div>` ;
    //         }
    //     }
    // }
    
    // My method was sequential so can cause error for displaying + fetching so use Promise.all() + map() for parallel execution.
    async function displayMovies( movies ) {
        const detailPromises = movies.map( movie => {
            const detailsUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`;
            return fetchMovieDetails(detailsUrl)
                   .then( result => ( { movie, result } ) )
                   .catch( error => {
                       console.error( "Error fetching details for:", movie.Title, error ) ;
                       throw new Error( error.message || "Movies Details Not Found" ) ;
            } ) ;
        } ) ;
        
        movieResults.innerHTML = '' ;
        try {
            const allDetails = await Promise.all(detailPromises) ;
    
            allDetails.forEach( ( { movie, result } ) => {
                const genreArr = result.Genre ?.split(", ") || [] ;

                const posterUrl = ( result.Poster && result.Poster !== "N/A" )  ? result.Poster  : "https://0xdf.gitlab.io/img/image-20240922165323104.png" ;
    
                movieResults.innerHTML += `
                    <div class="movie-card">
                        <img src="${posterUrl}" alt="Poster Not Found">
                        <div class="movie-rating">⭐ ${ result.imdbRating || "N/A" }</div>
                        <div class="movie-info">
                            <h3>${movie.Title}</h3>
                            <p>${movie.Year}</p>
                            <div class="movie-genre">
                                ${ genreArr.slice(0, 3).map(genre => `<span>${genre}</span>`).join('') }
                            </div>
                            <div class="movie-plot">
                                ${ ( result.Plot && result.Plot !== "N/A" ) ? result.Plot
                                    : `A film directed by ${result.Director || "Unknown"}, featuring ${result.Actors || "N/A"}, known for ${result.Awards || "its performances"}.`
                                }
                            </div>
                        </div>
                    </div>` ;
            } ) ;
        } 
        catch (error) {
            console.error("Error fetching movie details:", error);
            movieResults.innerHTML = `
                <div class="error-msg">
                    <div class="no-results-icon">🎬</div>
                    <h3>Something went wrong</h3>
                    <p>${ error.message || "Please try searching again later."}</p>
                </div>`;
        }
    }
    

    const suggestions = [
        "Search by title: Batman, Oppenheimer, Dune, The Matrix",
        "Fan favorites: The Dark Knight, Top Gun: Maverick, Inception",
        "Explore genres: Action, Romance, Thriller, Sci-Fi",
        "Type a movie name (e.g., Interstellar, Inception)"
    ];
      
    
    let suggestionIdx = 0;
    setInterval( () => {
        if ( !searchInput.value ) {
            searchInput.placeholder = suggestions[suggestionIdx];
            suggestionIdx = ( suggestionIdx + 1 ) % suggestions.length ;
        }
    }, 3000 ) ;
} ) ;