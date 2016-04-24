
# Data Structures

```
Component
  x Number
  y Number
  width Number
  height Number
  
Markdown :< Component
  content String
  align String = 'left' | 'right' | 'center' | 'justify'
  
Image :< Component
  external Boolean
  key Optional<String>
  url Optional<String>
  
Slide
  id Unique<String>
  name String
  components Array<Component>
  
Lecture
  id Unique<String>
  name String
  instructor String
  course String
  theme String
  slides Array<Slide>
```
