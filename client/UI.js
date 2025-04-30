class UI{

    toggleClass = (el,clas)=> el.classList.toggle(clas);
    
    showError = (msg,container)=>{
        if(container.querySelector('.error'))return;
        const error = document.createElement('P');
        error.classList.add('error');
        error.textContent = msg;
        container.appendChild(error);
        setTimeout(()=>error.remove(),4000);
    }

    createMessageDOM = (msg,name,container)=>{
        const colors = ['black,blue,cyan,purple,pink,yellow,darkblue,darkgreen','orange','orangered','tomato','turquoise','darkcyan','red'];
        const randomColor = Math.floor(Math.random() * colors.length);

        const messageDOM = document.createElement('li');
        const id = document.createElement('span');
        id.textContent = name === 'System'? `${name} said: ` : `User-${name} said: `;
        id.style.color = (name === 'System')? 'gray' : colors[randomColor];
       
        const content = document.createElement('span');
        content.textContent = msg;
        
        messageDOM.append(id,content);
        container.appendChild(messageDOM);
        
        messageDOM.scrollIntoView({
        behavior: 'smooth', 
        block: 'end', 
        });
    }

    createLabelRoom = (data,container,refNode,defaultText)=>{   

        defaultText.style.display = data.length? 'none' : 'block';
        const labels = Array.from(container.children);
       
        labels.forEach(label => { 
            if (label !== refNode && label !== defaultText) {
                label.remove();
            }
        });

        data.forEach(str => {
            const room = document.createElement('BUTTON');
            room.textContent = str;
            room.dataset.id = str;
            container.insertBefore(room,refNode);
        })

       
    }

    showChat = (chat, containerMessageRoom)=>{
        if(containerMessageRoom.childElementCount > 0)containerMessageRoom.innerHTML = "";
        chat.classList.add('appear');
        const display = window.getComputedStyle(chat).display;
        setTimeout(() => {
            if (display === 'none') {
                chat.style.display = 'block';
            }
        }, 300);
    }

    closeChat = (chat)=>{
        chat.classList.add('disappear');
        setTimeout(()=>{
            chat.style.display = 'none';
            chat.classList.remove('disappear');
        },300);
    }


}

export default UI;