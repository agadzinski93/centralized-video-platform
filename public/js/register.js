const init = () => {
    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let password = document.getElementById("regpassword");
    let repeat_password = document.getElementById("repeat_password");
    let btnLogin = document.getElementById("btnLogin");

    username.addEventListener("keyup", () => {
        let length = username.value.length;
        if (length < 3 || length > 24) {
            username.classList.add("loggingTextError");
            username.nextElementSibling.classList.add("loggingTextErrorMessageShow");
            btnLogin.classList.add("btnLoginError");
        } else {
            username.classList.remove("loggingTextError");
            username.nextElementSibling.classList.remove(
            "loggingTextErrorMessageShow"
            );
            btnLogin.classList.remove("btnLoginError");
        }
    });
    email.addEventListener("keyup", () => {
        let length = email.value.length;
        if (!email.value.includes("@") || length > 45) {
            email.classList.add("loggingTextError");
            email.nextElementSibling.classList.add("loggingTextErrorMessageShow");
            btnLogin.classList.add("btnLoginError");
        } else {
            email.classList.remove("loggingTextError");
            email.nextElementSibling.classList.remove("loggingTextErrorMessageShow");
            btnLogin.classList.remove("btnLoginError");
        }
    });
    password.addEventListener("keyup", () => {
            let length = password.value.length;
            if (length < 3 || length > 24) {
                password.classList.add("loggingTextError");
                password.nextElementSibling.classList.add("loggingTextErrorMessageShow");
                btnLogin.classList.add("btnLoginError");
            } else {
                password.classList.remove("loggingTextError");
                password.nextElementSibling.classList.remove(
                "loggingTextErrorMessageShow"
                );
                btnLogin.classList.remove("btnLoginError");
            }
    });
    repeat_password.addEventListener("keyup", () => {
            if (password.value !== repeat_password.value) {
                repeat_password.classList.add("loggingTextError");
                repeat_password.nextElementSibling.classList.add(
                "loggingTextErrorMessageShow"
                );
                btnLogin.classList.add("btnLoginError");
            } else {
                repeat_password.classList.remove("loggingTextError");
                repeat_password.nextElementSibling.classList.remove(
                "loggingTextErrorMessageShow"
                );
                btnLogin.classList.remove("btnLoginError");
            }
    });
}
init();