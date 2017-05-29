import { Component, Input, OnInit } from '@angular/core';
import { Api } from '../../providers/api';

@Component({
  selector: 'artist-image',
  templateUrl: 'artist-image.html'
})
export class ArtistImageComponent implements OnInit {
  @Input() artist: any = {};
  @Input() size: string = 'md';
  private artistImageUrl: string;

  constructor(
    public api: Api
  ) {}

  ngOnInit() {
    this.setArtistImage(this.artist || {});
  }

  private setArtistImage(artist: any): void {
    const { artistsUrl } = this.api;
    const { id } = artist;

    if (id) {
      this.artistImageUrl = `${artistsUrl}/${id}/image?size=${this.size}`;
    } else {
      this.artistImageUrl = 'assets/images/no-image.png';
    }
  }
}
