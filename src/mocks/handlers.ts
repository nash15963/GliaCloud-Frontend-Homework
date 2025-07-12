import { http, HttpResponse } from 'msw'
import { mockTranscriptData, createMockVideoProcessResponse } from './mocks'
import type { ISentence, ITranscriptSection } from '@/types/domain/video'

export const handlers = [
  // Mock API endpoint for video processing
  http.post('/api/video/process', async ({ request }) => {
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const responseData = createMockVideoProcessResponse(videoFile)
    
    return HttpResponse.json({
      success: true,
      data: responseData
    })
  }),

  // Mock API endpoint for getting transcript data
  http.get('/api/video/:videoId/transcript', () => {
    return HttpResponse.json({
      success: true,
      data: mockTranscriptData
    })
  }),

  // Mock API endpoint for updating highlight selections
  http.patch('/api/video/:videoId/highlights', async ({ request }) => {
    const updates = await request.json() as { sentences: Array<{ id: string; isHighlight: boolean }> }
    
    // Mock updating sentences with new highlight status
    const updatedSentences: ISentence[] = []
    mockTranscriptData.sections.forEach((section: ITranscriptSection) => {
      section.sentences.forEach((sentence: ISentence) => {
        const update = updates?.sentences?.find((s) => s.id === sentence.id)
        if (update) {
          updatedSentences.push({
            ...sentence,
            isHighlight: update.isHighlight
          })
        } else {
          updatedSentences.push(sentence)
        }
      })
    })
    
    return HttpResponse.json({
      success: true,
      data: { updatedSentences }
    })
  }),

  // Mock API endpoint for generating highlight video
  http.post('/api/video/:videoId/generate-highlights', async () => {
    // Simulate video generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    return HttpResponse.json({
      success: true,
      data: {
        highlightVideoUrl: '/mock-highlight-video.mp4',
        duration: 45
      }
    })
  })
]