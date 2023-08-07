/*!
* Start Bootstrap - Bare v5.0.9 (https://startbootstrap.com/template/bare)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

  // Search
  let search_input = document.getElementById("search-input");
  
  search_input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
          event.preventDefault();
          do_search();
      }
  });
  
  function do_search() {
      let search_string = search_input.value;
  
  
      // implement search algorithm
      console.log("do_search() function pressed.");
  
      search_input.value = "";
  }


  
  
  