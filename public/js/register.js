let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("regpassword");
let repeat_password = document.getElementById("repeat_password");

const toggleLoginButton = () => {
    let btnLogin = document.getElementById("btnLogin");
    if (document.querySelectorAll('.loggingTextErrorMessageShow').length > 0) {
        btnLogin.disabled = true;
        btnLogin.classList.add("btnLoginError");
    }
    else {
        btnLogin.disabled = false;
        btnLogin.classList.remove("btnLoginError");
    }
}
const validateUsername = () => {
    let length = username.value.length;
    if (length < 3 || length > 24) {
        username.classList.add("loggingTextError");
        username.nextElementSibling.classList.add("loggingTextErrorMessageShow");
        toggleLoginButton(false);
    } else {
        username.classList.remove("loggingTextError");
        username.nextElementSibling.classList.remove(
        "loggingTextErrorMessageShow"
        );
        toggleLoginButton();
    }
}
const validateEmail = () => {
    let length = email.value.length;
    if (!email.value.includes("@") || length > 45) {
        email.classList.add("loggingTextError");
        email.nextElementSibling.classList.add("loggingTextErrorMessageShow");
        toggleLoginButton(false);
    } else {
        email.classList.remove("loggingTextError");
        email.nextElementSibling.classList.remove("loggingTextErrorMessageShow");
        toggleLoginButton();
    }
}
const validatePassword = () => {
    let length = password.value.length;
    if (length < 3 || length > 24) {
        password.classList.add("loggingTextError");
        password.nextElementSibling.classList.add("loggingTextErrorMessageShow");
        toggleLoginButton(false);
    } else {
        password.classList.remove("loggingTextError");
        password.nextElementSibling.classList.remove(
        "loggingTextErrorMessageShow"
        );
        toggleLoginButton();
    }
}
const validateRepeatPassword = () => {
    if (password.value !== repeat_password.value) {
        repeat_password.classList.add("loggingTextError");
        repeat_password.nextElementSibling.classList.add(
        "loggingTextErrorMessageShow"
        );
        toggleLoginButton();
    } else {
        repeat_password.classList.remove("loggingTextError");
        repeat_password.nextElementSibling.classList.remove(
        "loggingTextErrorMessageShow"
        );
        toggleLoginButton();
    }
}
const init = () => {
    username.addEventListener("keyup", validateUsername);
    email.addEventListener("keyup", validateEmail);
    password.addEventListener("keyup", validatePassword);
    repeat_password.addEventListener("keyup", validateRepeatPassword);
    if (username.value.length > 0) {
        validateUsername();
    }
    if (email.value.length > 0) {
        validateEmail();
    }
    if (password.value.length > 0) {
        validatePassword();
    }
    toggleLoginButton();
}
init();