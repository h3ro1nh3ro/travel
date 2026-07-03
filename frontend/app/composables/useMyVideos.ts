export interface MyVideo {
  id: number
  username: string
  trick: string
  trickEmoji: string
  trickColor: string
  score: number
  likes: number
  views: number
  ago: string
  feedback: string
  previewUrl: string
  isNew?: boolean
  section: 'video' | 'challenge' | 'skate'
  challengeTitle?: string
}

export function useMyVideos() {
  const videos = useState<MyVideo[]>('my_videos', () => [])

  function addVideo(v: MyVideo) {
    videos.value = [v, ...videos.value]
  }

  return { videos, addVideo }
}
