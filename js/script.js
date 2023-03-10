{
  const TEXTAREA_INITIAL_HEIGHT = 30;

  const form = document.querySelector('.form');
  const controls = form.querySelectorAll('input, textarea');
  const list = document.querySelector('.messages-list');

  form.elements.date.valueAsDate = new Date();
  form.elements.date.max = new Date().toISOString().split("T")[0];
  form.elements.text.addEventListener('input', fitTextareaHeight);
  form.addEventListener('submit', onSubmit);

  for (const control of controls) {
    control.addEventListener('input', event => {
      removeInvalidFieldMessage(event.currentTarget);
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    removeInvalidFieldMessages();

    if (!validateForm()) return;

    const newMessageItem = createMessageItem(getFormData());
    list.append(newMessageItem);

    clearForm();
    fitTextareaHeight();
  }

  function fitTextareaHeight() {
    form.elements.text.style.height = 0;
    const computedStyle = getComputedStyle(form.elements.text);
    const verticalPaddings = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

    const newHeight = Math.max(form.elements.text.scrollHeight - verticalPaddings, TEXTAREA_INITIAL_HEIGHT);
    form.elements.text.style.height = newHeight + 'px';
  }

  function validateForm() {
    let isValid = true;

    for (const control of controls) {
      if (control.dataset.required !== undefined && !control.value.trim()) {
        markInvalid(control, 'Это поле обязательное');
        isValid = false;
      }
      else if (control.name !== 'date' && control.value.trim().length < 3) {
        markInvalid(control, 'Должно быть хотя бы 3 символа');
        isValid = false;
      }
    }

    return isValid;
  }

  function markInvalid(element, message) {
    const container = element.closest('.form__label');

    const invalidFieldMessage = document.createElement('span');
    invalidFieldMessage.classList.add('invalid-field-message');
    invalidFieldMessage.textContent = message;

    container.append(invalidFieldMessage);
  }

  function removeInvalidFieldMessages() {
    for (const message of form.querySelectorAll('.invalid-field-message')) {
      message.remove();
    }
  }

  function removeInvalidFieldMessage(element) {
    element.closest('.form__label')?.querySelector('.invalid-field-message')?.remove?.();
  }

  function createMessageItem({name, date, text}) {
    const item = document.createElement('li');
    item.className = 'message';
    item.innerHTML = `
    <div class="message__top">
      <span class="message__name">${name}</span>
      <span class="message__date">${createDateTimeString(date)}</span>
    </div>
    <div class="message__text">${text}</div>
    <button class="message__delete" aria-label="Удалить сообщение" title="Удалить сообщение"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.1 14.8L14.8 9.1" stroke="#fafcff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
    <path d="M14.8 14.8L9.1 9.1" stroke="#fafcff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#fafcff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
    </svg></button>
    <button class="message__like" aria-label="Поставить лайк" title="Поставить лайк"><svg version="1.1" width='150' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><path class="bentblocks_een" d="M20.9,4C18.9,4,17.2,4.7,16,6.0C14.7,4.7,13.0,4,11.0,4l0.0,0.0C7.0,3.9,4,7.7,4,12 c0,8,11.9,16,11.9,16h0.1C16.0,28,28,20,28,12C28,7.7,24.9,3.9,20.9,4.0z" fill='transparent' stroke='#fff' stroke-width='2'></path></svg></button>
    `;

    item.querySelector('.message__delete').addEventListener('click', () => {
      item.remove();
    });

    item.querySelector('.message__like').addEventListener('click', event => {
      const likeElement = event.currentTarget;
      const isLiked = !(likeElement.dataset.liked === 'true');
      const hint = (isLiked ? 'Убрать' : 'Поставить') + ' лайк';

      likeElement.setAttribute('aria-label', hint);
      likeElement.setAttribute('title', hint);
      likeElement.classList.toggle('liked', isLiked);
      likeElement.dataset.liked = isLiked;
    });

    return item;
  }

  function getFormData() {
    const formDate = form.elements.date.valueAsDate || new Date();
    const now = new Date();
    
    formDate.setHours(now.getHours());
    formDate.setMinutes(now.getMinutes());
    formDate.setSeconds(now.getSeconds());

    return {
      name: form.elements.name.value.trim(),
      date: formDate,
      text: form.elements.text.value.trim()
    };
  }

  function clearForm() {
    form.elements.name.value = '';
    form.elements.date.valueAsDate = new Date();
    form.elements.text.value = '';
  }

  function createDateTimeString(date) {
    const elapsedDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

    let dateString;
    if (elapsedDays === 0) dateString = 'сегодня';
    if (elapsedDays === 1) dateString = 'вчера';
    if (elapsedDays > 1) dateString = elapsedDays + ' ' + inflectWord(elapsedDays, ['день', 'дня', 'дней']) + ' назад';

    let timeString = date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});

    return dateString + ', ' + timeString;
  }

  function inflectWord(number, inflectedWords) {
    if (number % 100 >= 10 && number % 100 <= 19) return inflectedWords[2];
    const lastDigit = number % 10;
    if (lastDigit == 1) return inflectedWords[0];
    if (lastDigit >= 2 && lastDigit <= 4) return inflectedWords[1];
    return inflectedWords[2];
  }



  const examples = [
    {name: 'Инокентий', date: new Date(), text: 'Одобрительный комментарий'},
    {name: 'Марфа', date: new Date(), text: 'Неодобрительный комментарий'},
    {name: 'John', date: new Date(), text: "Who's there?!"},
  ];
  list.append(...examples.map(createMessageItem));

}


