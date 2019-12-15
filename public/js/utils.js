'use strict';


const displayTime = timestamp => {
    const time = new Date(parseInt(timestamp, 10));
    return timeago.format(time);
};

const displayMessage = ({ target, type, text}) => {
    const msg = document.createElement('div');
    msg.className = `alert alert-${type} mt-5 mb-5`;
    msg.innerText = text;

    target.appendChild(msg);
};

const stripTags = input => {

    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
    const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

    return input.replace(commentsAndPhpTags, '').replace(tags, '');
};

const postData = async ({url, data}) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type' : 'application/json'
        }
    });

    return await response.json();
};

const scrollIntoView = element => {
  setTimeout(() => {
    element.scrollTop = ( element.scrollHeight - element.clientHeight ); 
  }, 500);  
};

const addMobileClass = element => {
    if(/mobile/i.test(navigator.userAgent)) {
        element.classList.add('mobile');
    }
};