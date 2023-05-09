import React, { useContext } from 'react';
import CurrentUserContext from '../contexts/CurrentUserContext';

function Card(props) {
  const userItem = useContext(CurrentUserContext);
  const isOwn = props.card.owner._id === userItem._id;
  const isLiked = props.card.likes.some((item) => item._id === userItem._id);

  function makeClick() {
    props.onCardClick(props.card);
  }
  function makeDelete() {
    props.onCardDelete(props.card);
  }
  function makeLike() {
    props.onCardLike(props.card);
  }

  return (
    <div className="cards__item">
      {isOwn && (
        <button
          type="button"
          className="cards__delete"
          onClick={makeDelete}
          aria-label="Удалить"
        />
      )}
      <img
        src={props.link}
        className="cards__image"
        onClick={makeClick}
        alt={props.name}
      />
      <div className="cards__info">
        <h2 className="cards__description">{props.name}</h2>
        <div className="cards__like-area">
          <button
            type="button"
            className={`cards__like ${isLiked ? 'cards__like_active' : ''}`}
            onClick={makeLike}
            aria-label="Like"
          />
          <p className="cards__like-counter">
            {props.likeCount > 0 ? props.likeCount : null}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Card;
