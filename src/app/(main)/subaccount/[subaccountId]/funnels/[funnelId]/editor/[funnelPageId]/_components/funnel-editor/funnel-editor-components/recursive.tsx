import { EditorElement } from '@/providers/editor/editor-provider'
import React from 'react'
import TextComponent from './text'
import Container from './container'
// import VideoComponent from './video'
// import LinkComponent from './link-component'
// import ContactFormComponent from './contact-form-component'
// import Checkout from './checkout'

type Props = {
  element: EditorElement
}

const Recursive = ({ element }: Props) => {
  switch (element.type) {
    case 'text':
      return <TextComponent element={element} />
    case '__body':
      return <Container element={element} />
  
    default:
      return null
  }
}

export default Recursive
