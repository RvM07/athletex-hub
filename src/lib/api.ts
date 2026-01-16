import { supabase } from './supabase';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  class_name: string;
  date: string;
  time: string;
  trainer?: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
  is_popular: boolean;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    plan?: string;
  }) => {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
        },
      },
    });

    if (authError) throw new Error(authError.message);

    // Create user profile in profiles table
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'user',
      });

      if (profileError) console.error('Profile creation error:', profileError);
    }

    return {
      user: {
        id: authData.user?.id,
        name: userData.name,
        email: userData.email,
        role: 'user',
      },
      session: authData.session,
    };
  },

  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name,
        role: profile?.role || 'user',
      },
      session: data.session,
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name,
      phone: profile?.phone,
      role: profile?.role || 'user',
    };
  },

  getStoredUser: () => {
    // Supabase handles session storage automatically
    return null;
  },

  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        callback({
          id: session.user.id,
          email: session.user.email!,
          name: profile?.name || session.user.user_metadata?.name,
          phone: profile?.phone,
          role: profile?.role || 'user',
          created_at: session.user.created_at,
        });
      } else {
        callback(null);
      }
    });
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData: {
    className: string;
    date: string;
    time: string;
    trainer?: string;
    notes?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('bookings').insert({
      user_id: user.id,
      class_name: bookingData.className,
      date: bookingData.date,
      time: bookingData.time,
      trainer: bookingData.trainer,
      notes: bookingData.notes,
      status: 'confirmed',
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
  },

  getMyBookings: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  cancel: async (bookingId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

// Contact API
export const contactAPI = {
  submit: async (contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    const { data, error } = await supabase.from('contact_messages').insert({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      subject: contactData.subject,
      message: contactData.message,
    }).select().single();

    if (error) throw new Error(error.message);
    return { message: 'Message sent successfully!', data };
  },
};

// Membership API
export const membershipAPI = {
  getPlans: async () => {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw new Error(error.message);
    
    // Return default plans if none exist
    if (!data || data.length === 0) {
      return [
        {
          id: '1',
          name: 'Monthly',
          price: 999,
          duration_months: 1,
          features: ['Full gym access', 'Locker facility', 'Basic classes'],
          is_popular: false,
        },
        {
          id: '2',
          name: 'Quarterly',
          price: 2499,
          duration_months: 3,
          features: ['Full gym access', 'Locker facility', 'All classes', 'Personal trainer (2 sessions)'],
          is_popular: true,
        },
        {
          id: '3',
          name: 'Yearly',
          price: 6999,
          duration_months: 12,
          features: ['Full gym access', 'Locker facility', 'All classes', 'Personal trainer (12 sessions)', 'Diet consultation'],
          is_popular: false,
        },
      ];
    }
    
    return data;
  },

  subscribe: async (planId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('memberships').insert({
      user_id: user.id,
      plan_id: planId,
      status: 'active',
      start_date: new Date().toISOString(),
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
  },

  getStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('memberships')
      .select('*, membership_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
};

export default {
  auth: authAPI,
  bookings: bookingsAPI,
  contact: contactAPI,
  membership: membershipAPI,
};
