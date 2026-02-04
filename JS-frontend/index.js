const menuIcon = document.getElementById("menu-icon");
const mobileMenu = document.getElementById("mobile-menu");

menuIcon.addEventListener("click", (e) =>{
  e.stopPropagation(); //stops immediate close when clicking icon
  mobileMenu.classList.toggle("active");
});

document.querySelectorAll(".mobile-menu a").forEach(link =>{
  link.addEventListener("click", () =>{
    mobileMenu.classList.remove("active");
  });
});

//close menu when clicking outside
window.addEventListener("click", (e) =>{
  if(!mobileMenu.contains(e.target) && !menuIcon.contains(e.target)){
    mobileMenu.classList.remove("active");
  }
});
// console.log("hello im here");

