/*!
* Start Bootstrap - Bare v5.0.9 (https://startbootstrap.com/template/bare)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// Login and Register Popup
document.getElementById("nav-link-login").addEventListener("click", function() {
  document.getElementById("login-popup").style.display = "block";
});

document.querySelector(".close-button-login").addEventListener("click", function() {
  document.getElementById("login-popup").style.display = "none";
});

document.getElementById("nav-link-register").addEventListener("click", function() {
  document.getElementById("register-popup").style.display = "block";
});

document.querySelector(".close-button-register").addEventListener("click", function() {
  document.getElementById("register-popup").style.display = "none";
});

// Register submit
async function handleRegSubmit(event) {
  event.preventDefault(); // Prevent the default form submission behavior
  const form = event.target;
  const url = form.action;
  const formData = new FormData(form);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    
    if (response.ok) {
      const data = await response.json();
      if (data.registerMessage) {
        const messageElement = document.getElementById('register-message');
        messageElement.textContent = data.registerMessage;
      }
    } else {
      // Handle the error response here, if needed
      console.error('Error:', response.statusText);
    }
  } catch (error) {
    // Handle any other errors that may occur during the fetch request
    console.error('Error:', error);
  }
}

// Add event listener to the form
$(document).on('submit', '#register-form', handleRegSubmit);

// Login submit
async function handleLoginSubmit(event) {
  event.preventDefault(); // Prevent the default form submission behavior
  const form = event.target;
  const url = form.action;
  const formData = new FormData(form);

  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    
    
    if (response.ok) {
      const data = await response.json();
      if (data.loginMessage) {
        const messageElement = document.getElementById('login-message');
        messageElement.textContent = data.loginMessage;
        if (data.loginMessage === 'Login successful') {
          window.location.href = '/login/success'
        }
      }
    } else {
      // Handle the error response here, if needed
      console.error('Error:', response.statusText);
    }

  } catch (error) {
    // Handle any other errors that may occur during the fetch request
    console.error('Error:', error);
  }
}

// Add event listener to the form
$(document).on('submit', '#login-form', handleLoginSubmit);



function do_search() {
    let search_string = search_input.value;


    // implement search algorithm
    console.log("do_search() function pressed.");

    search_input.value = "";
}


