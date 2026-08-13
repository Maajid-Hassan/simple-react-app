import { useTasks } from '../context/TaskContext';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

export default function Profile() {
  const { userProfile, setUserProfile } = useTasks();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(userProfile?.name);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="glass-panel p-8 rounded-3xl border border-bmain shadow-lg">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-bmuted">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-accent/20 shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-black text-tmain uppercase tracking-tight">{userProfile?.name || 'Your Name'}</h1>
            <p className="text-sm font-bold text-tsub uppercase tracking-widest mt-1">Manage Profile Details</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-tmuted uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={userProfile?.name || ''}
              onChange={handleChange}
              className="w-full bg-inbg border border-bmuted rounded-xl px-4 py-3 text-sm text-tmain font-medium focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-tmuted uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Age
            </label>
            <input
              type="number"
              name="age"
              value={userProfile?.age || ''}
              onChange={handleChange}
              className="w-full bg-inbg border border-bmuted rounded-xl px-4 py-3 text-sm text-tmain font-medium focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter your age"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-tmuted uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Gender
            </label>
            <select
              name="gender"
              value={userProfile?.gender || 'male'}
              onChange={handleChange}
              className="w-full bg-inbg border border-bmuted rounded-xl px-4 py-3 text-sm text-tmain font-medium focus:outline-none focus:border-accent transition-colors"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-tmuted uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={userProfile?.email || ''}
              onChange={handleChange}
              className="w-full bg-inbg border border-bmuted rounded-xl px-4 py-3 text-sm text-tmain font-medium focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-tmuted uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} /> Phone Number
            </label>
            <input
              type="text"
              name="number"
              value={userProfile?.number || ''}
              onChange={handleChange}
              className="w-full bg-inbg border border-bmuted rounded-xl px-4 py-3 text-sm text-tmain font-medium focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-tmuted uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Address
            </label>
            <input
              type="text"
              name="address"
              value={userProfile?.address || ''}
              onChange={handleChange}
              className="w-full bg-inbg border border-bmuted rounded-xl px-4 py-3 text-sm text-tmain font-medium focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter your address"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
