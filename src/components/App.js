import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import PopupEditAvatar from './PopupEditAvatar';
import PopupEditProfile from './PopupEditProfile';
import PopupAddCard from './PopupAddCard';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';
import Login from './Login';
import CurrentUserContext from '../contexts/CurrentUserContext';
import apiConnect from '../utils/Api';
import apiAuth from '../utils/AuthApi';
import InfoTooltip from './InfoTooltip';

function App() {
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [cards, setCards] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [status, setStatus] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const history = useHistory();

  useEffect(() => {
    Promise.all([apiConnect.getUserData(), apiConnect.getInitialCards()])
      .then(([userItem, initialCards]) => {
        setCurrentUser(userItem);
        setCards(initialCards);
      })
      .catch((err) => {
        console.log(`Возникла глобальная ошибка, ${err}`);
      });
  }, []);

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      apiAuth
        .tokenVerification(userToken)
        .then((res) => {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push('/');
        })
        .catch((err) => {
          console.log(`Возникла ошибка верификации токена, ${err}`);
        });
    }
  }, [history, isLoggedIn]);

  function editAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function editProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function addPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function deleteCard(card) {
    apiConnect
      .deleteCard(card._id)
      .then(() => {
        setCards((cardsArray) =>
          cardsArray.filter((cardItem) => cardItem._id !== card._id)
        );
      })
      .catch((err) => {
        console.log(`Возникла ошибка при удалении карточки, ${err}`);
      });
  }

  function makeUpdateAvatar(link) {
    apiConnect
      .sendAvatarData(link)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Возникла ошибка при изменении аватара, ${err}`);
      });
  }

  function makeCardClick(cardItem) {
    setIsImageOpen(true);
    setSelectedCard({
      ...selectedCard,
      name: cardItem.name,
      link: cardItem.link,
    });
  }

  function makeCardLike(card) {
    const isLiked = card.likes.some(
      (cardItem) => cardItem._id === currentUser._id
    );
    apiConnect
      .changeLikeCardStatus(card._id, !isLiked)
      .then((cardsItem) => {
        setCards((state) =>
          state.map((cardItem) =>
            cardItem._id === card._id ? cardsItem : cardItem
          )
        );
      })
      .catch((err) => {
        console.log(`Возникла ошибка при обработке лайков, ${err}`);
      });
  }

  function makeUpdateUser(userItem) {
    apiConnect
      .sendUserData(userItem.name, userItem.about)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Возникла ошибка при редактировании профиля, ${err}`);
      });
  }

  function makeAddCard(cardItem) {
    apiConnect
      .addNewCard(cardItem.name, cardItem.link)
      .then((card) => {
        setCards([card, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Возникла ошибка при добавлении новой карточки, ${err}`);
      });
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImageOpen(false);
    setTooltipOpen(false);
  }

  function makeRegister(password, email) {
    apiAuth
      .userRegistration(password, email)
      .then(() => {
        setTooltipOpen(true);
        setStatus(true);
      })
      .catch((err) => {
        console.log(`Возникла ошибка при регистрации пользователя, ${err}`);
        setTooltipOpen(true);
        setStatus(false);
      });
  }

  function makeLogin(password, email) {
    apiAuth
      .userAuthorization(password, email)
      .then((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          setEmail(email);
          setIsLoggedIn(true);
          history.push('/');
        }
      })
      .catch((err) => {
        console.log(`Возникла ошибка при авторизации, ${err}`);
        setTooltipOpen(true);
        setStatus(false);
      });
  }

  function makeLogout() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header isLoggedIn={isLoggedIn} email={email} isLogout={makeLogout} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            isLoggedIn={isLoggedIn}
            component={Main}
            onEditAvatar={editAvatarClick}
            onEditProfile={editProfileClick}
            onAddPlace={addPlaceClick}
            onCardClick={makeCardClick}
            onCardDelete={deleteCard}
            onCardLike={makeCardLike}
            cards={cards}
          />
          <Route path={`/sign-in`}>
            <Login
              makeLogin={makeLogin}
              isOpen={tooltipOpen}
              onClose={closeAllPopups}
              status={status}
            />
          </Route>
          <Route path={`/sign-up`}>
            <Register
              makeRegister={makeRegister}
              isOpen={tooltipOpen}
              onClose={closeAllPopups}
              status={status}
            />
          </Route>
        </Switch>
        <Footer />
        <PopupEditAvatar
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={makeUpdateAvatar}
        />
        <PopupEditProfile
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={makeUpdateUser}
        />
        <PopupAddCard
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={makeAddCard}
        />
        <ImagePopup
          isOpen={isImageOpen}
          onClose={closeAllPopups}
          card={selectedCard}
        />
        <InfoTooltip
          isOpen={tooltipOpen}
          onClose={closeAllPopups}
          status={status}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
