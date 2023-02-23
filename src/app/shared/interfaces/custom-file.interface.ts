import { SafeResourceUrl } from '@angular/platform-browser';

export class CustomFile extends File{
    progress?: number;
    url?: SafeResourceUrl;
}
