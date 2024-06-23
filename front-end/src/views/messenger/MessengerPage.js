import React from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import '../../style/viewsStyle/MessengerPage.css';

function MessengerPage() {
  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2 d-flex">

          <div className="sidebar">

          <div class="srch_bar">
          <div class="stylish-input-group">
            <input type="text" class="search-bar"  placeholder="Search" />
            <span class="input-group-addon">
            <button type="button"> <i class="fa fa-search" aria-hidden="true"></i> </button>
            </span> </div>
        </div>
            <ul>
              <li>
                <span>Megan Leib</span>
                <span>12 set</span>
              </li>
              <li>
                <span>Dave Corlew</span>
                <span>Let's meet for a coffee or some</span>
              </li>
              <li>
                <span>Jerome Seiber</span>
                <span>Hi, how are you?</span>
              </li>
              <li>
                <span>Thomas Dbtn</span>
                <span>See you tomorrow!</span>
              </li>
              <li>
                <span>Elsie Amador</span>
                <span>What is going on?</span>
              </li>
              <li>
                <span>Billy Southard</span>
                <span>Ahahah</span>
              </li>
              <li>
                <span>Paul Walker</span>
                <span>Type your message here</span>
              </li>
            </ul>
          </div>

          <div className="conversation">
            <div className="conversation-header">
              <span>Megan Leib</span>
            </div>
            <div className="conversation-body">
              <div className="message message-left">
                <span>Hi, how are you?</span>
                <span>14:58</span>
              </div>
              <div className="message message-left">
                <span>What are you doing tonight? Want to go take a drink?</span>
                <span>14:58</span>
              </div>
              <div className="message message-right">
                <span>Hey Megan! It's been a while 😊</span>
                <span>15:04</span>
              </div>
              <div className="message message-right">
                <span>When can we meet?</span>
                <span>15:04</span>
              </div>
              <div className="message message-left">
                <span>9 pm at the bar if possible 🥺</span>
                <span>15:09</span>
              </div>
            </div>
            <div className="conversation-footer">
              <input type="text" placeholder="Type your message here" />
              <button>Send</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MessengerPage;
