/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/DnD.js
class DnD {
  constructor(trello) {
    this.trello = trello;
    this.container = trello.container;
    this.data = trello.data;
    this.draggedEl = null;
    this.ghostEl = null;
    this.shiftX = null;
    this.shiftY = null;
    this.id = null;
    this.clone = null;
    this.sibling = null;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }
  toAppoint() {
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.querySelector('.trello__body').addEventListener('mouseleave', this.onMouseLeave);
  }
  onMouseLeave() {
    if (!this.draggedEl) {
      return;
    }
    this.draggedEl.classList.remove('darkened');
    this.ghostEl.remove();
    document.body.style.cursor = 'auto';
    this.container.removeEventListener('mousemove', this.onMouseMove);
  }
  onMouseUp(evt) {
    const elemBelow = document.elementFromPoint(evt.clientX, evt.clientY);
    if (!this.draggedEl || elemBelow.closest('.card__delete')) {
      return;
    }
    if (this.clone && (elemBelow.closest('.col__content') || elemBelow.closest('.col__footer') || elemBelow.closest('.col__header'))) {
      if (this.clone.nextElementSibling) {
        this.sibling = {
          id: this.clone.nextElementSibling.dataset.id,
          column: this.clone.closest('.col__content').dataset.name
        };
      } else if (elemBelow.closest('.darkened')) {
        if (elemBelow.closest('.col__card').nextElementSibling) {
          this.sibling = {
            id: elemBelow.closest('.col__card').nextElementSibling.dataset.id,
            column: elemBelow.closest('.col__content').dataset.name
          };
        } else {
          this.sibling = {
            id: null,
            column: elemBelow.closest('.col__content').dataset.name
          };
        }
      }
    } else {
      this.sibling = null;
    }
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.data.relocate(this.draggedEl, this.sibling);
    this.trello.redrawDOM();
    this.trello.data.saveState();
  }
  onMouseMove(evt) {
    evt.preventDefault();
    if (document.querySelector('[data-id="000000"]')) {
      document.querySelector('[data-id="000000"]').remove();
    }
    if (!this.draggedEl) {
      return;
    }
    this.ghostEl.style.left = `${evt.pageX - this.shiftX}px`;
    this.ghostEl.style.top = `${evt.pageY - this.shiftY}px`;
    this.addGhostEl(evt);
  }
  addGhostEl(evt) {
    this.ghostEl.hidden = true;
    const elemBelow = document.elementFromPoint(evt.clientX, evt.clientY);
    this.ghostEl.hidden = false;
    if (!elemBelow) return;
    const target = elemBelow.closest('.col__card');
    this.clone = this.draggedEl.cloneNode(true);
    this.clone.dataset.id = '000000';
    if (elemBelow.closest('.col__content')) {
      if (!elemBelow.closest('.col__content').hasChildNodes()) {
        elemBelow.closest('.col__content').appendChild(this.clone);
      } else if (target && target.dataset.id !== this.id) {
        const {
          top
        } = elemBelow.getBoundingClientRect();
        if (target.previousElementSibling && target.previousElementSibling.dataset.id === this.id) {
          elemBelow.closest('.col__content').insertBefore(this.clone, elemBelow.closest('.col__card').nextElementSibling);
        }
        if (target.nextElementSibling && target.nextElementSibling.dataset.id === this.id) {
          elemBelow.closest('.col__content').insertBefore(this.clone, elemBelow.closest('.col__card'));
        }
        if (evt.pageY > window.scrollY + top + elemBelow.closest('.col__card').offsetHeight / 2) {
          elemBelow.closest('.col__content').insertBefore(this.clone, elemBelow.closest('.col__card').nextElementSibling);
        } else {
          elemBelow.closest('.col__content').insertBefore(this.clone, elemBelow.closest('.col__card'));
        }
      } else {
        const down50 = document.elementFromPoint(evt.clientX, evt.clientY + 70);
        const up50 = document.elementFromPoint(evt.clientX, evt.clientY - 50);
        if (down50.closest('.col__footer')) {
          elemBelow.closest('.col__content').appendChild(this.clone);
        } else if (up50.closest('.col__header')) {
          elemBelow.closest('.col__content').prepend(this.clone);
        }
      }
    }
    if (elemBelow.closest('.col__footer')) {
      elemBelow.closest('.trello__col').querySelector('.col__content').scrollTop = elemBelow.closest('.trello__col').querySelector('.col__content').scrollHeight;
      elemBelow.closest('.trello__col').querySelector('.col__content').appendChild(this.clone);
    }
    if (elemBelow.closest('.col__header')) {
      elemBelow.closest('.trello__col').querySelector('.col__content').prepend(this.clone);
    }
  }
  onMouseDown(evt) {
    evt.preventDefault();
    const {
      classList
    } = evt.target;
    if (!evt.target.closest('.col__card') || classList.contains('card__delete') || classList.contains('card__subBtn')) {
      return;
    }
    if (evt.target.closest('.col__card')) {
      document.body.style.cursor = 'grabbing';
      this.draggedEl = evt.target.closest('.col__card');
      this.id = this.draggedEl.dataset.id;
      const coordsDrag = this.draggedEl.getBoundingClientRect();
      this.shiftX = evt.clientX - coordsDrag.left;
      this.shiftY = evt.clientY - coordsDrag.top;
      this.ghostEl = this.draggedEl.cloneNode(true);
      this.ghostEl.classList.add('dragged');
      this.ghostEl.dataset.id = '111111';
      this.draggedEl.classList.add('darkened');
      document.querySelector('.trello__body').appendChild(this.ghostEl);
      this.ghostEl.style.width = `${this.draggedEl.offsetWidth}px`;
      this.ghostEl.style.left = `${coordsDrag.left}px`;
      this.ghostEl.style.top = `${coordsDrag.top}px`;
      this.container.addEventListener('mousemove', this.onMouseMove);
    }
  }
}
;// CONCATENATED MODULE: ./src/js/Data.js
class Data {
  constructor() {
    this.memory = {
      todo: [],
      progress: [],
      done: []
    };
    this.drag = null;
  }
  getId() {
    const id = Math.floor(Math.random() * 1000000);
    const arr = [...this.memory.todo, ...this.memory.progress, ...this.memory.done];
    if (arr.find(e => e.id === id)) {
      return this.getId();
    }
    return id;
  }
  create(prop, text) {
    this.memory[prop].push({
      id: this.getId(),
      text
    });
  }
  read(id, prop) {
    return this.memory[prop].find(e => e.id === id);
  }
  delete(id, prop) {
    const idx = this.memory[prop].findIndex(e => e.id === +id);
    this.memory[prop].splice(idx, 1);
  }
  relocate(dragged, sibling) {
    if (sibling) {
      [this.memory.todo, this.memory.progress, this.memory.done].forEach(column => {
        if (column.find(e => e.id === +dragged.dataset.id)) {
          this.drag = column.find(e => e.id === +dragged.dataset.id);
          const idxDrag = column.findIndex(e => e.id === this.drag.id);
          column.splice(idxDrag, 1);
          const idxSibling = this.memory[sibling.column].findIndex(e => e.id === +sibling.id);
          if (sibling.id) {
            this.memory[sibling.column].splice(idxSibling, 0, this.drag);
          } else {
            this.memory[sibling.column].push(this.drag);
          }
        }
      });
    }
  }
  saveState() {
    localStorage.setItem('memory', JSON.stringify(this.memory));
  }
  update() {
    if (localStorage.getItem('memory')) {
      this.memory = JSON.parse(localStorage.getItem('memory'));
    }
  }
}
;// CONCATENATED MODULE: ./src/js/Trello.js

class Trello {
  constructor() {
    this.data = new Data();
    this.container = null;
    this.adding = null;
    this.texarea = null;
    this.onClick = this.onClick.bind(this);
  }
  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
  }
  drawUI() {
    this.container.innerHTML = Trello.markUp;
    this.data.update();
    this.redrawDOM();
  }
  redrawDOM() {
    if (document.querySelector('[data-id="111111"]')) document.querySelector('[data-id="111111"]').remove();
    if (document.querySelector('[data-id="000000"]')) document.querySelector('[data-id="000000"]').remove();
    this.redrawColumn(this.container.querySelector('[data-name="todo"]'));
    this.redrawColumn(this.container.querySelector('[data-name="progress"]'));
    this.redrawColumn(this.container.querySelector('[data-name="done"]'));
    document.body.style.cursor = 'auto';
  }
  toAppoint() {
    this.container.addEventListener('click', this.onClick);
  }
  onClick(evt) {
    if (evt.target.className === 'col__add' || evt.target.className === 'col__addText') {
      return this.onColAddClick(evt);
    }
    if (evt.target.className === 'add__cancel') {
      return this.onColAddingCancelClick(evt);
    }
    if (evt.target.className === 'add__button') {
      return this.addCard(evt);
    }
    if (evt.target.className === 'card__delete') {
      return this.deleteCard(evt);
    }
    if (evt.target.className === 'card__subBtn') {
      return evt.target.closest('.col__card').querySelector('.card__subMenu').classList.toggle('d_none');
    }
    return false;
  }
  deleteCard(evt) {
    const targetID = evt.target.closest('.col__card').dataset.id;
    const container = evt.target.closest('.col__content');
    this.data.delete(targetID, container.dataset.name);
    this.redrawColumn(container);
    this.data.saveState();
  }
  addCard(evt) {
    this.textarea = evt.target.closest('.col__footer').querySelector('.add__textarea');
    const title = this.textarea.value;
    const colContent = evt.target.closest('.trello__col').querySelector('.col__content');
    if (title) {
      this.data.create(colContent.dataset.name, title);
      this.redrawColumn(colContent);
      this.textarea.value = '';
      this.adding.classList.add('d_none');
      this.data.saveState();
    }
  }
  redrawColumn(column) {
    this.column = column;
    const prop = column.dataset.name;
    this.column.innerHTML = '';
    this.data.memory[prop].forEach(e => {
      this.column.insertAdjacentHTML('beforeend', Trello.cardMarkUP(e.text, e.id));
      this.checkScroll(column);
    });
  }
  checkScroll(column) {
    this.column = column;
    const scroll = this.column.closest('.trello__col').querySelector('.scroll');
    if (this.column.offsetHeight >= 555) {
      scroll.classList.remove('d_none');
      return;
    }
    scroll.className = 'scroll d_none';
  }
  onColAddingCancelClick(evt) {
    this.adding.classList.add('d_none');
    this.textarea = evt.target.closest('.col__footer').querySelector('.add__textarea');
    this.textarea.value = '';
  }
  onColAddClick(evt) {
    [...this.container.querySelectorAll('.col__adding')].forEach(e => e.classList.add('d_none'));
    this.adding = evt.target.closest('.col__footer').querySelector('.col__adding');
    this.adding.classList.remove('d_none');
    const textarea = this.adding.querySelector('.add__textarea');
    textarea.focus();
  }
  static cardMarkUP(text, id) {
    return `<div data-id="${id}" class="col__card card">
    <button class="card__delete">&#10006;</button>
    <div class="card__text">${text}</div>
    <button class="card__subBtn"></button>
    <span class="card__subMenu d_none">
      <label class="subMenu__item">
        <button class="like">&#x1F44D;</button>
        <span class="quantity">1</span>
      </label>
      <label class="subMenu__item">
        <button class="dizlike">&#128078;</button>
        <span class="quantity">2</span>
      </label>
      <label class="subMenu__item">
        <span class="mes"></span>
        <span class="quantity">3</span>
      </label>
    </span>
  </div>`;
  }
  static get markUp() {
    return `<div class="trello">
    <div class="trello__body">
      <div class="trello__content">
        <div class="trello__col col">
          <div class="col__header">
            <h3 class="col__title">TODO</h3>
            <button class="col__menu"></button>
          </div>
          <div data-name="todo" class="col__content"></div>
          <div class="col__footer">
            <span class="scroll d_none"></span>
            <button class="col__add">&#10010; <span class="col__addText">Add another card</span></button>
            <div class="col__adding add d_none">
              <textarea class="add__textarea" placeholder="Enter a title for this card..."></textarea>
              <div class="add__controls">
                <div class="add__buttons">
                  <button class="add__button">Add Card</button>
                  <button class="add__cancel">&#10006;</button>
                </div>
                <button class="col__menu"></button>
              </div>
            </div>
          </div>
        </div>
        <div class="trello__col col">
          <div class="col__header">
            <h3 class="col__title">IN PROGRESS</h3>
            <button class="col__menu"></button>
          </div>
          <div data-name="progress" class="col__content"></div>
          <div class="col__footer">
            <span class="scroll d_none"></span>
            <button class="col__add">&#10010; <span class="col__addText">Add another card</span></button>
            <div class="col__adding add d_none">
              <textarea class="add__textarea" placeholder="Enter a title for this card..."></textarea>
              <div class="add__controls">
                <div class="add__buttons">
                  <button class="add__button">Add Card</button>
                  <button class="add__cancel">&#10006;</button>
                </div>
                <button class="col__menu"></button>
              </div>
            </div>
          </div>
        </div>
        <div class="trello__col col">
          <div class="col__header">
            <h3 class="col__title">DONE</h3>
            <button class="col__menu"></button>
          </div>
          <div data-name="done" class="col__content"></div>
          <div class="col__footer">
            <span class="scroll d_none"></span>
            <button class="col__add">&#10010; <span class="col__addText">Add another card</span></button>
            <div class="col__adding add d_none">
              <textarea class="add__textarea" placeholder="Enter a title for this card..."></textarea>
              <div class="add__controls">
                <div class="add__buttons">
                  <button class="add__button">Add Card</button>
                  <button class="add__cancel">&#10006;</button>
                </div>
                <button class="col__menu"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  }
}
;// CONCATENATED MODULE: ./src/js/app.js


const trello = new Trello();
trello.bindToDOM(document.querySelector('.container'));
trello.drawUI();
trello.toAppoint();
const dnd = new DnD(trello);
dnd.toAppoint();
;// CONCATENATED MODULE: ./src/index.js



/******/ })()
;