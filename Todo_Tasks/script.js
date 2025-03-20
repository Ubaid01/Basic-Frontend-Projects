document.addEventListener("DOMContentLoaded", () => { /* Using document.addEventListener("DOMContentLoaded", () => { ... }) is important for ensuring that your JavaScript code runs only after the HTML document has been fully loaded and parsed. Like <script> loaded in <head> tag.
    */

    const todoInput = document.getElementById("todo-input") ;
    const addTaskButton = document.getElementById("add-task-btn") ;
    const todoList = document.getElementById("todo-list") ;
    // console.log( todoInput , addTaskButton , todoList ) ;


    // localStorage.removeItem("tasks") ; // To remove from localStorage.

    let tasks = JSON.parse( localStorage.getItem( "tasks" ) ) || [] ; // Use same "tasks" key for retrieving. and then render each instead of forcefully reloading DOM.
    tasks.forEach( (task) => renderTask( task ) ) ;

    // Mostly don't use arrow functions for events due to "this" context.
    addTaskButton.addEventListener("click", () => {
        addTask() ;
    } ) ;

    todoInput.addEventListener("keydown", function(e) {
        // console.log( e.key ) ;
        if( e.key === "Enter" )
            addTask() ;
    } ) ;

    // todoInput.addEventListener( "focus", () => {
    //     todoInput.setAttribute("autocomplete", "on");  // Only enable suggestions while the user is typing AND "off" on "blur".
    // } ) ;

    function addTask( ) {
        const taskText = todoInput.value.trim() ; // Trim leading spaces.
        if( taskText === "" || tasks.find(task => task.text === taskText) ) return ;

        const newTask = {
            id: Date.now() , /* To add unique value for object. */
            text: taskText ,
            completed: false
        } ;

        tasks.push( newTask ) ;
        saveTasks() ;
        renderTask( newTask ) ;
        todoInput.value = "" ; // Clears input.
        // console.log( tasks ) ;
        todoInput.blur(); // Removes focus from the input field so suggestions don't clutter.
    }

    function renderTask( task ) {
        // console.log( task.text ) ;
        const li = document.createElement("li") ;
        li.setAttribute("data-id", task.id) ;
        if( task.completed ) li.classList.add("completed") ;
        li.innerHTML = `<span>${task.text}</span>
                        <button>Delete</button>` ;
               
        
        li.addEventListener("click", (e) => {
            if( e.target.tagName === "BUTTON" ) return ; // Only toggle if someone clicks on list.
            task.completed = !task.completed ;
            li.classList.toggle("completed") ; // To remove/add completed "class".
            saveTasks() ; // Save Again.
        } ) ;

        // Add a listener only for button.
        li.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation() ; // Prevent toggle from firing AS ELSE "toggle" event() could also occur.
            tasks = tasks.filter( (t) => t.id !== task.id ) ; // Only store tasks which are not clicked.
            li.classList.add("del") ;
            
            // setTimeout( () => {
            //     li.remove() ;
            //     saveTasks() ;
            //     li.classList.remove("del") ;
            // } , 475 ) ; 

            // Instead of Timeout() can directly call "transitionend" event 
            li.addEventListener("transitionend", () => {
                li.remove() ;
                saveTasks();
                li.classList.remove("del") ;
            } ) ;
            
        } ) ;

        todoList.appendChild( li ) ;
    }

    function saveTasks() {
        localStorage.setItem( "tasks" , JSON.stringify( tasks ) ) ; /* key can be of anyType "preferably string" BUT value MUST BE string and use JSON so that structure remains same WHILE conversion from array to string OR vice-versa. Also it rewrites each task. */
    }

} ) ;