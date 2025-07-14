import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, doc, getDoc, setDoc, orderBy, limit, getDocs, where, updateDoc, increment } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyJXTe1wmJr2n_Zmpbtc1ttaDSUSlc_QvQ",
  authDomain: "manmast-kahaniyan.firebaseapp.com",
  projectId: "manmast-kahaniyan",
  storageBucket: "manmast-kahaniyan.appspot.com",
  messagingSenderId: "655413669805",
  appId: "1:655413669805:web:7eefb2125d5a68daf27f34"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Helper Functions ---
const ANONYMOUS_NAMES = ['Wanderer', 'Dreamer', 'Storyteller', 'Observer', 'Voyager', 'Poet', 'Scribe'];
const getRandomAnonymousName = () => ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
const getSessionUserId = () => {
    let sessionId = sessionStorage.getItem('manmast_kahaniyan_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('manmast_kahaniyan_session_id', sessionId);
    }
    return sessionId;
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};


// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [sessionUser] = useState({ uid: getSessionUserId() });

  const navigateTo = (page, storyId = null) => {
    setPage(page);
    setSelectedStoryId(storyId);
  };

  return (
    <>
      <style>{`
        body {
          background-color: #FFFDD0;
        }
      `}</style>
      <div className="min-h-screen font-sans flex flex-col" style={{backgroundColor: '#FFFDD0'}}>
        <Navbar navigateTo={navigateTo} />
        <main className="p-4 md:p-8 bg-slate-100 flex-grow">
          {page === 'home' && <StoryFeed navigateTo={navigateTo} />}
          {page === 'create' && <CreateStory navigateTo={navigateTo} user={sessionUser} />}
          {page === 'chat' && <AnonymousChat user={sessionUser} />}
          {page === 'story' && selectedStoryId && <StoryPage storyId={selectedStoryId} />}
          {page === 'categories' && <CategoriesPage />}
          {page === 'writers' && <WritersPage />}
          {page === 'about' && <AboutPage />}
          {page === 'my-stories' && <MyStoriesPage navigateTo={navigateTo} user={sessionUser} />}
        </main>
        <FloatingWriteButton navigateTo={navigateTo} />
         <footer className="text-center p-4 text-gray-400 text-sm bg-slate-800">
          <p>&copy; 2025 Manmast Kahaniyan. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

// --- Components ---

function Navbar({ navigateTo }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    navigateTo(page);
    setIsMenuOpen(false);
  }

  return (
    <header className="bg-slate-800 shadow-lg p-4 flex justify-between items-center relative z-20">
        {/* Left Menu Button */}
        <div className="w-1/3">
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-slate-700 transition-colors">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>

        {/* Centered Title */}
        <div className="w-1/3 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500 cursor-pointer" onClick={() => handleNavClick('home')}>
                Manmast Kahaniyan
            </h1>
        </div>
        
        {/* Right side buttons for desktop */}
        <div className="w-1/3 flex justify-end items-center space-x-4">
            <button onClick={() => handleNavClick('my-stories')} className="hidden md:block text-gray-300 hover:text-white transition-colors font-semibold">My Story</button>
            <button onClick={() => handleNavClick('chat')} className="hidden md:block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold">Talk to stranger</button>
        </div>

      {/* Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-2xl transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out w-64 z-30`}>
        <div className="p-5 flex justify-between items-center border-b">
            <h2 className="text-xl font-bold text-orange-600">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md hover:bg-orange-100">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div className="flex flex-col p-5 space-y-4">
          <button onClick={() => handleNavClick('home')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">Home</button>
          <button onClick={() => handleNavClick('my-stories')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">My Story</button>
          <button onClick={() => handleNavClick('create')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">Write Story</button>
          <button onClick={() => handleNavClick('categories')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">Categories</button>
          <button onClick={() => handleNavClick('writers')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">Writers</button>
          <button onClick={() => handleNavClick('chat')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">Talk to stranger</button>
          <button onClick={() => handleNavClick('about')} className="text-gray-700 hover:text-orange-600 text-left p-2 rounded-md hover:bg-orange-50 transition-colors">About</button>
        </div>
      </div>
      {/* Overlay */}
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20"></div>}
    </header>
  );
}

function StoryFeed({ navigateTo, userId = null }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seedDatabaseIfNeeded = async () => {
      if (userId) return; // Don't seed on my stories page
      const storiesCollectionRef = collection(db, "stories");
      const q = query(storiesCollectionRef, limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log("Seeding demo stories...");
        const demoStories = [
          {
            title: "The Last Sunset",
            authorName: "Asha",
            content: "The twin suns of Kepler-186f cast long, purple shadows across the crimson desert. Elara adjusted the visor of her helmet, her breath fogging the cold plasteel. This was it. The last sunset she would ever see on this world. Tomorrow, the transport ship would arrive, taking her back to a crowded, concrete Earth she barely remembered. A single tear escaped her eye, freezing instantly into a tiny, glittering diamond on her cheek. She reached out a gloved hand, as if to hold the fading light, to capture a moment of this beautiful, lonely place forever.",
            likes: 15,
            createdAt: serverTimestamp()
          },
          {
            title: "The Spice Merchant's Secret",
            authorName: "Rohan",
            content: "In the heart of the old city's bazaar, where the air hummed with a thousand scents, Kaelen the spice merchant was known for one thing: the Crimson Bloom. A pinch of the fiery red powder could make any dish unforgettable, any memory sharper. But no one knew where it came from. Late one night, a cloaked figure approached his stall. 'I know your secret,' the stranger whispered, their voice a low hiss. 'I know about the garden that grows only under a moon that isn't there.' Kaelen's hand froze over a sack of saffron. The time for secrets was over.",
            likes: 42,
            createdAt: serverTimestamp()
          },
          {
            title: "Echoes in the Rain",
            authorName: "Priya",
            content: "The monsoon rain fell in relentless sheets, turning the city streets into shimmering rivers of light. Anjali stood under the flimsy awning of a closed bookshop, her umbrella forgotten at home. Just as she resigned herself to getting soaked, a deep blue umbrella appeared over her head. 'Looks like you could use some help,' a kind voice said. She turned to see a man with warm eyes and a gentle smile. They stood there for a moment, the world a blur of rain and neon around them, a silent conversation passing between two strangers who felt like they had met a thousand times before.",
            likes: 98,
            createdAt: serverTimestamp()
          }
        ];
        await Promise.all(demoStories.map(story => addDoc(storiesCollectionRef, { ...story, authorId: 'demo_user' })));
      }
    };
    seedDatabaseIfNeeded().catch(console.error);
  }, [userId]);

  useEffect(() => {
    let storiesQuery;
    if (userId) {
      storiesQuery = query(collection(db, "stories"), where("authorId", "==", userId), orderBy("createdAt", "desc"));
    } else {
      storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(storiesQuery, (querySnapshot) => {
      const storiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  if (loading) return <div className="text-center p-10">Loading stories...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">{userId ? 'My Stories' : 'Community Stories'}</h2>
      {stories.length > 0 ? (
        <div className="grid gap-8">
          {stories.map(story => (
            <div key={story.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <div className="cursor-pointer" onClick={() => navigateTo('story', story.id)}>
                <h3 className="text-xl md:text-2xl font-semibold text-orange-700">{story.title}</h3>
                <p className="text-gray-600 mt-2 mb-4">by {story.authorName}</p>
                <p className="text-gray-800 line-clamp-3">{story.content}</p>
              </div>
              <StoryActions story={story} />
            </div>
          ))}
        </div>
      ) : (
        userId && <NoStoryPopup navigateTo={navigateTo} />
      )}
      {stories.length === 0 && !userId && !loading && <p className="text-center text-gray-500">No stories published yet. Be the first!</p>}
    </div>
  );
}

function StoryActions({ story }) {
    const handleLike = async () => {
        const storyRef = doc(db, "stories", story.id);
        await updateDoc(storyRef, {
            likes: increment(1)
        });
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-gray-500">
            <div className="flex items-center space-x-4">
                <button onClick={handleLike} className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    <span>{story.likes || 0}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.003 8.003 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.417 11.321a6 6 0 008.566 0L14 10.147l-1.417.828-1.165-2.018L10 10l-1.417-1.171-1.165 2.018L6 10.147l-1.583 1.174z" clipRule="evenodd"></path></svg>
                    <span>Comment</span>
                </button>
            </div>
            <span className="text-sm">{formatDate(story.createdAt)}</span>
        </div>
    );
}


function MyStoriesPage({ navigateTo, user }) {
    return <StoryFeed navigateTo={navigateTo} userId={user.uid} />;
}

function NoStoryPopup({ navigateTo }) {
    const [show, setShow] = useState(true);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" onClick={() => setShow(false)}>
            <div className="bg-white p-8 rounded-lg shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-4">No stories found.</h3>
                <p className="text-gray-600">share your story</p>
            </div>
        </div>
    );
}

function CreateStory({ navigateTo, user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !authorName) {
      setError('Title, content, and author name cannot be empty.');
      return;
    }
    setError('');
    try {
      await addDoc(collection(db, "stories"), { title, content, authorId: user.uid, authorName, createdAt: serverTimestamp(), likes: 0 });
      navigateTo('my-stories');
    } catch (err) {
      setError('Failed to publish story. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Share Your Story</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Author Name</label>
          <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-3 border rounded-md focus:ring-orange-500 focus:border-orange-500" placeholder="Your name or a pseudonym" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-md focus:ring-orange-500 focus:border-orange-500" placeholder="Your story's title" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-semibold">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 border rounded-md h-64 focus:ring-orange-500 focus:border-orange-500" placeholder="Once upon a time..."></textarea>
        </div>
        <button type="submit" className="w-full bg-orange-600 text-white p-3 rounded-md hover:bg-orange-700 transition-colors">Publish Story</button>
      </form>
    </div>
  );
}

function StoryPage({ storyId }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storyDocRef = doc(db, "stories", storyId);
    const unsubscribe = onSnapshot(storyDocRef, (doc) => {
        if (doc.exists()) {
            setStory({ id: doc.id, ...doc.data() });
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [storyId]);

  if (loading) return <div className="text-center">Loading story...</div>;
  if (!story) return <div className="text-center text-red-500">Story not found.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{story.title}</h2>
      <p className="text-gray-600 mb-6 text-lg">by {story.authorName}</p>
      <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{story.content}</div>
      <StoryActions story={story} />
    </div>
  );
}

function AnonymousChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anonymousName] = useState(getRandomAnonymousName());
  const [isConnecting, setIsConnecting] = useState(true);
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsConnecting(false);
    }, 2000); // Show connecting message for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isConnecting) {
        const q = query(collection(db, "chats"), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(msgs);
        });
        return () => unsubscribe();
    }
  }, [isConnecting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    let locationData = { city: 'Unknown', country: 'Unknown', ip: 'N/A' };
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        locationData = { city: data.city, country: data.country_name, ip: data.ip };
      }
    } catch (error) {
      console.error("Could not fetch location data:", error);
    }
    await addDoc(collection(db, "chats"), { text: newMessage, createdAt: serverTimestamp(), anonymousName, userId: user.uid, ...locationData });
    setNewMessage('');
  };
  
  if (isConnecting) {
    return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="text-center">
                <p className="text-xl font-semibold text-orange-600">Connecting you to a stranger...</p>
                <p className="text-gray-500">Please wait a moment.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[80vh] md:h-[70vh] flex flex-col bg-white rounded-lg shadow-2xl">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-center">Talk to stranger</h2>
        <p className="text-center text-sm text-gray-500">You are chatting as: <span className="font-semibold text-orange-600">{anonymousName}</span></p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className="mb-4">
            <span className="font-bold text-orange-500">{msg.anonymousName}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 p-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Type your message..." />
        <button type="submit" className="bg-orange-600 text-white px-6 py-3 rounded-r-md hover:bg-orange-700 transition-colors">Send</button>
      </form>
    </div>
  );
}

function CategoriesPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Categories</h2>
            <p className="text-gray-700">This page will display different story categories. This feature is coming soon!</p>
        </div>
    );
}

function WritersPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Writers</h2>
            <p className="text-gray-700">This page will feature a list of writers on the platform. This feature is coming soon!</p>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Manmast Kahaniyan</h2>
            <p className="text-gray-700 leading-relaxed">
                Welcome to Manmast Kahaniyan, a place for storytellers and readers to connect. Our mission is to provide a platform where creativity can flourish and where every voice can be heard. Whether you're a seasoned author or a first-time writer, this is your space to share your tales with a vibrant and supportive community.
            </p>
        </div>
    );
}

function FloatingWriteButton({ navigateTo }) {
    return (
        <button 
            onClick={() => navigateTo('create')} 
            className="fixed bottom-8 right-8 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-110 z-30"
            aria-label="Write a new story"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
        </button>
    );
}

