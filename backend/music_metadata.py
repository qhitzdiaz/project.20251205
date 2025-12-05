"""
Music Metadata Service
Fetches album artwork and metadata from online sources
"""
import requests
import time
from urllib.parse import quote

class MusicMetadataService:
    """Service for fetching music metadata and album artwork"""

    # MusicBrainz API endpoint
    MUSICBRAINZ_API = "https://musicbrainz.org/ws/2"
    COVERART_API = "https://coverartarchive.org/release"

    # iTunes Search API (fallback)
    ITUNES_API = "https://itunes.apple.com/search"

    # User agent for API requests
    USER_AGENT = "QhitzMediaPlayer/1.0 (https://qhitz.com)"

    @staticmethod
    def search_album_art_itunes(artist, album):
        """
        Search for album art using iTunes API
        Returns URL to album artwork or None
        """
        try:
            query = f"{artist} {album}".strip()
            params = {
                'term': query,
                'media': 'music',
                'entity': 'album',
                'limit': 1
            }

            response = requests.get(
                MusicMetadataService.ITUNES_API,
                params=params,
                headers={'User-Agent': MusicMetadataService.USER_AGENT},
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('resultCount', 0) > 0:
                    result = data['results'][0]
                    # Get highest quality artwork (replace 100x100 with 600x600)
                    artwork_url = result.get('artworkUrl100', '').replace('100x100', '600x600')
                    return {
                        'artwork_url': artwork_url,
                        'artist': result.get('artistName'),
                        'album': result.get('collectionName'),
                        'genre': result.get('primaryGenreName'),
                        'release_date': result.get('releaseDate'),
                        'source': 'iTunes'
                    }
        except Exception as e:
            print(f"iTunes API error: {e}")

        return None

    @staticmethod
    def search_album_art_musicbrainz(artist, album):
        """
        Search for album art using MusicBrainz and Cover Art Archive
        Returns URL to album artwork or None
        """
        try:
            # Search for the release in MusicBrainz
            query = f'artist:"{artist}" AND release:"{album}"'
            params = {
                'query': query,
                'fmt': 'json',
                'limit': 1
            }

            headers = {'User-Agent': MusicMetadataService.USER_AGENT}

            response = requests.get(
                f"{MusicMetadataService.MUSICBRAINZ_API}/release/",
                params=params,
                headers=headers,
                timeout=5
            )

            # Rate limiting - wait 1 second between requests
            time.sleep(1)

            if response.status_code == 200:
                data = response.json()
                releases = data.get('releases', [])

                if releases:
                    release_id = releases[0]['id']

                    # Try to get cover art
                    coverart_url = f"{MusicMetadataService.COVERART_API}/{release_id}"
                    coverart_response = requests.get(
                        coverart_url,
                        headers=headers,
                        timeout=5
                    )

                    if coverart_response.status_code == 200:
                        coverart_data = coverart_response.json()
                        images = coverart_data.get('images', [])

                        # Get the front cover
                        for image in images:
                            if image.get('front', False):
                                return {
                                    'artwork_url': image['image'],
                                    'thumbnail_url': image.get('thumbnails', {}).get('large'),
                                    'source': 'MusicBrainz'
                                }

                        # If no front cover, use first image
                        if images:
                            return {
                                'artwork_url': images[0]['image'],
                                'thumbnail_url': images[0].get('thumbnails', {}).get('large'),
                                'source': 'MusicBrainz'
                            }
        except Exception as e:
            print(f"MusicBrainz API error: {e}")

        return None

    @staticmethod
    def get_album_artwork(artist, album, track_title=None):
        """
        Get album artwork from available sources
        Tries multiple sources in order: iTunes (faster), MusicBrainz
        """
        if not artist or not album:
            return None

        # Try iTunes first (faster and no rate limiting)
        metadata = MusicMetadataService.search_album_art_itunes(artist, album)

        # If iTunes fails, try MusicBrainz
        if not metadata:
            metadata = MusicMetadataService.search_album_art_musicbrainz(artist, album)

        return metadata

    @staticmethod
    def extract_metadata_from_filename(filename):
        """
        Extract artist and album from filename
        Common patterns: "Artist - Album - Track.mp3" or "Artist - Track.mp3"
        """
        import os
        name = os.path.splitext(filename)[0]

        # Try to split by common delimiters
        if ' - ' in name:
            parts = name.split(' - ')
            if len(parts) >= 3:
                return {
                    'artist': parts[0].strip(),
                    'album': parts[1].strip(),
                    'track': parts[2].strip()
                }
            elif len(parts) == 2:
                return {
                    'artist': parts[0].strip(),
                    'track': parts[1].strip(),
                    'album': None
                }

        return {
            'artist': None,
            'album': None,
            'track': name.strip()
        }
