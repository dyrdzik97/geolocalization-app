import { FC } from 'react'

interface ILocationProps {
  name: string
  rating: number
  commentsCount: number
}

const Location: FC<ILocationProps> = ({ name, rating, commentsCount }) => {
  return (
    <div className="location__container">
      <span>{name}</span>
      <span>Ocena: {rating}/5</span>
      <span>Komentarze: {commentsCount}</span>
    </div>
  )
}

export default Location
