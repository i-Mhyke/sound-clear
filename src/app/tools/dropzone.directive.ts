import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appDropzone]'
})
export class DropzoneDirective {
  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();
  constructor() { }

  //dragover listener
  @HostListener('dragover', ['$event']) onDragOver(event){
    event.preventDefault();
    this.hovered.emit(true);
  }

  //dropfile listener
  @HostListener('drop', ['$event']) onDrop(event){
    event.preventDefault();
    this.dropped.emit(event.dataTransfer.files);
    this.hovered.emit(false);
  }

  //dragLeave listener
  @HostListener('dragleave', ['$event']) onDragLeave(event){
    event.preventDefault();
    this.hovered.emit(false);
  }
}
