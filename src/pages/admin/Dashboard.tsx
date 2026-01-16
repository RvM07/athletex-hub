import { useState, useEffect } from "react";
import { 
  Users, Calendar, CreditCard, TrendingUp, 
  BarChart3, Clock, UserPlus, DollarSign,
  Menu, LogOut, Settings, Bell, Search,
  MoreVertical, Eye, Trash2,
  Check, X, Mail, Phone, MessageSquare,
  Target, ArrowUpRight, RefreshCw, Download,
  Filter, Plus, Edit, UserCheck, AlertCircle,
  ChevronLeft, FileDown, UserCog
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { authAPI } from "@/lib/api";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  class_name: string;
  date: string;
  time: string;
  trainer?: string;
  status: string;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface Membership {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date?: string;
  profiles?: {
    name: string;
    email: string;
  };
  membership_plans?: {
    name: string;
    price: number;
  };
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  newSignups: number;
  activeMembers: number;
  pendingBookings: number;
  unreadMessages: number;
  todayBookings: number;
}

// Sidebar navigation items
const navItems = [
  { name: "Overview", icon: BarChart3, id: "overview" },
  { name: "Members", icon: Users, id: "members" },
  { name: "Bookings", icon: Calendar, id: "bookings" },
  { name: "Memberships", icon: CreditCard, id: "memberships" },
  { name: "Messages", icon: MessageSquare, id: "messages" },
  { name: "Analytics", icon: TrendingUp, id: "analytics" },
  { name: "Settings", icon: Settings, id: "settings" },
];

const classOptions = [
  "Strength Training",
  "Yoga",
  "Zumba",
  "HIIT",
  "Pilates",
  "CrossFit",
  "Cardio Blast",
  "MMA",
  "Personal Training"
];

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminMode, setAdminMode] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    newSignups: 0,
    activeMembers: 0,
    pendingBookings: 0,
    unreadMessages: 0,
    todayBookings: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [createBookingDialogOpen, setCreateBookingDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', role: 'user' });
  const [newBooking, setNewBooking] = useState({ 
    user_id: '', 
    class_name: '', 
    date: '', 
    time: '', 
    trainer: '' 
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Get current admin
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (adminProfile) setCurrentAdmin(adminProfile);
      }
      
      // Fetch users/profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!profilesError && profilesData) {
        setUsers(profilesData);
      }

      // Fetch bookings with user info
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (!bookingsError && bookingsData) {
        setBookings(bookingsData);
      }

      // Fetch memberships with user and plan info
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('memberships')
        .select(`
          *,
          profiles:user_id (name, email),
          membership_plans:plan_id (name, price)
        `)
        .order('created_at', { ascending: false });
      
      if (!membershipsError && membershipsData) {
        setMemberships(membershipsData);
      }

      // Fetch contact messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!messagesError && messagesData) {
        setMessages(messagesData);
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      
      const newStats: Stats = {
        totalUsers: profilesData?.length || 0,
        totalBookings: bookingsData?.length || 0,
        totalRevenue: membershipsData?.reduce((acc, m) => acc + (m.membership_plans?.price || 0), 0) || 0,
        newSignups: profilesData?.filter(u => 
          new Date(u.created_at) >= subDays(new Date(), 7)
        ).length || 0,
        activeMembers: membershipsData?.filter(m => m.status === 'active').length || 0,
        pendingBookings: bookingsData?.filter(b => b.status === 'confirmed' && b.date >= today).length || 0,
        unreadMessages: messagesData?.filter(m => !m.is_read).length || 0,
        todayBookings: bookingsData?.filter(b => b.date === today).length || 0,
      };
      
      setStats(newStats);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle admin mode toggle
  const toggleAdminMode = () => {
    if (adminMode) {
      setAdminMode(false);
      navigate('/');
      toast({
        title: "👤 Switched to User Mode",
        description: "You are now viewing the site as a regular user",
        className: "bg-blue-600 text-white border-blue-600",
      });
    } else {
      setAdminMode(true);
      toast({
        title: "⚙️ Switched to Admin Mode",
        description: "You are now in admin mode",
        className: "bg-primary text-white border-primary",
      });
    }
  };

  // Handle booking status update
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      
      toast({
        title: "✅ Status Updated",
        description: `Booking status changed to ${newStatus}`,
        className: "bg-green-600 text-white border-green-600",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  // Handle delete booking
  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      if (error) throw error;
      
      setBookings(bookings.filter(b => b.id !== bookingId));
      
      toast({
        title: "🗑️ Deleted",
        description: "Booking has been deleted",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  // Handle message read
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      ));
      
      setStats(prev => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Handle delete message
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const message = messages.find(m => m.id === messageId);
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(messages.filter(m => m.id !== messageId));
      if (message && !message.is_read) {
        setStats(prev => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
      }
      setMessageDialogOpen(false);
      
      toast({
        title: "🗑️ Deleted",
        description: "Message has been deleted",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  // Handle delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      
      toast({
        title: "🗑️ User Deleted",
        description: "User has been removed from the system",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Handle update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      toast({
        title: "✅ Role Updated",
        description: `User role changed to ${newRole}`,
        className: "bg-green-600 text-white border-green-600",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  // Handle create booking (admin)
  const handleCreateBooking = async () => {
    if (!newBooking.user_id || !newBooking.class_name || !newBooking.date || !newBooking.time) {
      toast({
        title: "⚠️ Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setFormLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: newBooking.user_id,
          class_name: newBooking.class_name,
          date: newBooking.date,
          time: newBooking.time,
          trainer: newBooking.trainer || null,
          status: 'confirmed'
        })
        .select(`*, profiles:user_id (name, email)`)
        .single();
      
      if (error) throw error;
      
      setBookings([data, ...bookings]);
      setCreateBookingDialogOpen(false);
      setNewBooking({ user_id: '', class_name: '', date: '', time: '', trainer: '' });
      
      toast({
        title: "✅ Booking Created",
        description: "New booking has been created successfully",
        className: "bg-green-600 text-white border-green-600",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Export data to CSV
  const exportToCSV = (type: 'members' | 'bookings' | 'memberships' | 'messages') => {
    let csvContent = '';
    let filename = '';
    
    switch (type) {
      case 'members':
        csvContent = 'Name,Email,Phone,Role,Joined\n';
        users.forEach(u => {
          csvContent += `"${u.name || ''}","${u.email}","${u.phone || ''}","${u.role}","${format(new Date(u.created_at), 'yyyy-MM-dd')}"\n`;
        });
        filename = 'members_export.csv';
        break;
      case 'bookings':
        csvContent = 'Member,Email,Class,Date,Time,Trainer,Status\n';
        bookings.forEach(b => {
          csvContent += `"${b.profiles?.name || ''}","${b.profiles?.email || ''}","${b.class_name}","${b.date}","${b.time}","${b.trainer || ''}","${b.status}"\n`;
        });
        filename = 'bookings_export.csv';
        break;
      case 'memberships':
        csvContent = 'Member,Email,Plan,Amount,Start Date,Status\n';
        memberships.forEach(m => {
          csvContent += `"${m.profiles?.name || ''}","${m.profiles?.email || ''}","${m.membership_plans?.name || ''}","${(m.membership_plans?.price || 0) / 100}","${m.start_date}","${m.status}"\n`;
        });
        filename = 'memberships_export.csv';
        break;
      case 'messages':
        csvContent = 'Name,Email,Phone,Subject,Message,Date,Read\n';
        messages.forEach(m => {
          csvContent += `"${m.name}","${m.email}","${m.phone || ''}","${m.subject}","${m.message.replace(/"/g, '""')}","${format(new Date(m.created_at), 'yyyy-MM-dd')}","${m.is_read ? 'Yes' : 'No'}"\n`;
        });
        filename = 'messages_export.csv';
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    toast({
      title: "📁 Export Complete",
      description: `${type} exported to ${filename}`,
      className: "bg-green-600 text-white border-green-600",
    });
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats cards config
  const statsCards = [
    { 
      name: "Total Members", 
      value: stats.totalUsers.toString(), 
      change: `+${stats.newSignups} this week`,
      trend: "up",
      icon: Users, 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      name: "Today's Bookings", 
      value: stats.todayBookings.toString(), 
      change: `${stats.pendingBookings} upcoming`,
      trend: "up",
      icon: Calendar, 
      color: "from-green-500 to-emerald-500" 
    },
    { 
      name: "Revenue (Total)", 
      value: `₹${(stats.totalRevenue / 100).toLocaleString()}`, 
      change: `${stats.activeMembers} active members`,
      trend: "up",
      icon: CreditCard, 
      color: "from-primary to-red-600" 
    },
    { 
      name: "Messages", 
      value: stats.unreadMessages.toString(), 
      change: `${messages.length} total`,
      trend: stats.unreadMessages > 0 ? "alert" : "neutral",
      icon: MessageSquare, 
      color: "from-purple-500 to-pink-500" 
    },
  ];

  // Sidebar component (reusable for desktop and mobile)
  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className="p-4 border-b border-border">
        <Link to="/" className="block">
          <Logo size="sm" showText={sidebarOpen} />
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSearchQuery('');
              setStatusFilter('all');
              onItemClick?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
              activeTab === item.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            <span className="font-medium">{item.name}</span>
            {item.id === 'messages' && stats.unreadMessages > 0 && (
              <Badge className="ml-auto bg-primary text-xs px-1.5 py-0.5">{stats.unreadMessages}</Badge>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="glass-card rounded-xl p-4 sm:p-5 hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <h3 className="font-display text-xl sm:text-2xl lg:text-3xl mb-0.5">{stat.value}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">{stat.name}</p>
            <p className={`flex items-center gap-1 text-xs mt-2 ${
              stat.trend === 'up' ? 'text-green-500' : 
              stat.trend === 'alert' ? 'text-yellow-500' : 'text-muted-foreground'
            }`}>
              {stat.trend === 'up' && <ArrowUpRight size={12} />}
              {stat.trend === 'alert' && <AlertCircle size={12} />}
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="font-display text-lg sm:text-xl">RECENT BOOKINGS</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>
              View All
            </Button>
          </div>
          
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="p-3 rounded-lg bg-secondary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{booking.profiles?.name || 'Unknown'}</span>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' :
                    booking.status === 'cancelled' ? 'destructive' : 'secondary'
                  } className={
                    booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                    booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : ''
                  }>
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">{booking.class_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{format(new Date(booking.date), 'MMM d')}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{booking.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground text-xs font-medium pb-3">Member</th>
                  <th className="text-left text-muted-foreground text-xs font-medium pb-3">Class</th>
                  <th className="text-left text-muted-foreground text-xs font-medium pb-3">Date</th>
                  <th className="text-left text-muted-foreground text-xs font-medium pb-3">Time</th>
                  <th className="text-left text-muted-foreground text-xs font-medium pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium text-sm">{booking.profiles?.name || 'Unknown'}</td>
                    <td className="py-3 text-muted-foreground text-sm">{booking.class_name}</td>
                    <td className="py-3 text-muted-foreground text-sm">
                      {format(new Date(booking.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Clock size={12} />
                        {booking.time}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'cancelled' ? 'destructive' : 'secondary'
                      } className={
                        booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : ''
                      }>
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Members */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="font-display text-lg sm:text-xl">NEW MEMBERS</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('members')}>
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name || 'Unknown'}</p>
                  <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {user.role}
                </Badge>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No members yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Unread Messages Alert */}
      {stats.unreadMessages > 0 && (
        <div className="glass-card rounded-xl p-4 sm:p-6 border-yellow-500/50 bg-yellow-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg">You have {stats.unreadMessages} unread message{stats.unreadMessages > 1 ? 's' : ''}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Check your inbox to respond to member inquiries</p>
              </div>
            </div>
            <Button onClick={() => setActiveTab('messages')} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black">
              View Messages
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 hover:border-primary hover:text-primary text-sm"
          onClick={() => setAddMemberDialogOpen(true)}
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Add Member</span>
          <span className="sm:hidden">Add</span>
        </Button>
        <Button
          variant="outline"
          className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 hover:border-primary hover:text-primary text-sm"
          onClick={() => setCreateBookingDialogOpen(true)}
        >
          <Calendar size={18} />
          <span className="hidden sm:inline">Create Booking</span>
          <span className="sm:hidden">Book</span>
        </Button>
        <Button
          variant="outline"
          className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 hover:border-primary hover:text-primary text-sm"
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} />
          <span className="hidden sm:inline">View Analytics</span>
          <span className="sm:hidden">Analytics</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 hover:border-primary hover:text-primary text-sm"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportToCSV('members')} className="gap-2">
              <Users size={14} /> Export Members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV('bookings')} className="gap-2">
              <Calendar size={14} /> Export Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV('memberships')} className="gap-2">
              <CreditCard size={14} /> Export Memberships
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV('messages')} className="gap-2">
              <MessageSquare size={14} /> Export Messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Render Members Tab
  const renderMembers = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCSV('members')}>
            <FileDown size={14} />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setAddMemberDialogOpen(true)}>
            <Plus size={14} />
            Add Member
          </Button>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-sm font-medium text-white">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name || 'Unknown'}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="gap-2"
                    onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                  >
                    <UserCog size={14} /> {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 text-red-500 focus:text-red-500"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {user.role}
              </Badge>
              <span className="text-muted-foreground text-xs">
                Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No members found</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Member</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Email</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4 hidden lg:table-cell">Phone</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Role</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4 hidden md:table-cell">Joined</th>
                <th className="text-right text-muted-foreground text-xs font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </div>
                      <span className="font-medium text-sm">{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">{user.email}</td>
                  <td className="p-4 text-muted-foreground text-sm hidden lg:table-cell">{user.phone || '-'}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                        >
                          <UserCog size={14} /> {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-red-500 focus:text-red-500"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Bookings Tab
  const renderBookings = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setCreateBookingDialogOpen(true)}>
            <Plus size={14} />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{booking.profiles?.name || 'Unknown'}</p>
                <p className="text-primary text-xs font-medium">{booking.class_name}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="gap-2">
                    <Check size={14} /> Confirm
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'completed')} className="gap-2">
                    <UserCheck size={14} /> Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="gap-2">
                    <X size={14} /> Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteBooking(booking.id)} className="gap-2 text-red-500 focus:text-red-500">
                    <Trash2 size={14} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{format(new Date(booking.date), 'MMM d')}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{booking.time}</span>
              </div>
              <Badge variant={
                booking.status === 'confirmed' ? 'default' :
                booking.status === 'cancelled' ? 'destructive' : 'secondary'
              } className={
                booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                booking.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : ''
              }>
                {booking.status}
              </Badge>
            </div>
          </div>
        ))}
        {filteredBookings.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No bookings found</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Member</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Class</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Date</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Time</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4 hidden lg:table-cell">Trainer</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Status</th>
                <th className="text-right text-muted-foreground text-xs font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium text-sm">{booking.profiles?.name || 'Unknown'}</td>
                  <td className="p-4 text-muted-foreground text-sm">{booking.class_name}</td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {format(new Date(booking.date), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock size={12} />
                      {booking.time}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm hidden lg:table-cell">{booking.trainer || '-'}</td>
                  <td className="p-4">
                    <Badge variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'cancelled' ? 'destructive' : 'secondary'
                    } className={
                      booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      booking.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : ''
                    }>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="gap-2">
                          <Check size={14} /> Mark Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'completed')} className="gap-2">
                          <UserCheck size={14} /> Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="gap-2">
                          <X size={14} /> Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteBooking(booking.id)} className="gap-2 text-red-500 focus:text-red-500">
                          <Trash2 size={14} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Memberships Tab
  const renderMemberships = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-display">{memberships.filter(m => m.status === 'active').length}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Active Members</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-display">{memberships.filter(m => m.status === 'expired').length}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Expired</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-display">₹{(stats.totalRevenue / 100).toLocaleString()}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {memberships.map((membership) => (
          <div key={membership.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
                {membership.profiles?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{membership.profiles?.name || 'Unknown'}</p>
                <p className="text-muted-foreground text-xs truncate">{membership.profiles?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <Badge variant="outline" className="text-xs mb-1">{membership.membership_plans?.name || 'Unknown'}</Badge>
                <p className="text-muted-foreground text-xs">₹{((membership.membership_plans?.price || 0) / 100).toLocaleString()}</p>
              </div>
              <Badge variant={membership.status === 'active' ? 'default' : 'secondary'} className={
                membership.status === 'active' ? 'bg-green-500/10 text-green-500' : ''
              }>
                {membership.status}
              </Badge>
            </div>
          </div>
        ))}
        {memberships.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No memberships found</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Member</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Plan</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Amount</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4 hidden md:table-cell">Start Date</th>
                <th className="text-left text-muted-foreground text-xs font-medium p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <tr key={membership.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
                        {membership.profiles?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{membership.profiles?.name || 'Unknown'}</p>
                        <p className="text-muted-foreground text-xs truncate">{membership.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs">{membership.membership_plans?.name || 'Unknown'}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    ₹{((membership.membership_plans?.price || 0) / 100).toLocaleString()}
                  </td>
                  <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">
                    {format(new Date(membership.start_date), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4">
                    <Badge variant={membership.status === 'active' ? 'default' : 'secondary'} className={
                      membership.status === 'active' ? 'bg-green-500/10 text-green-500' : ''
                    }>
                      {membership.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {memberships.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No memberships found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Messages Tab
  const renderMessages = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="self-start shrink-0">
          {stats.unreadMessages} unread
        </Badge>
      </div>

      {/* Messages List */}
      <div className="grid gap-3 sm:gap-4">
        {filteredMessages.map((message) => (
          <div 
            key={message.id} 
            className={`glass-card rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:border-primary/50 ${
              !message.is_read ? 'border-l-4 border-l-primary' : ''
            }`}
            onClick={() => {
              setSelectedMessage(message);
              setMessageDialogOpen(true);
              if (!message.is_read) {
                markMessageAsRead(message.id);
              }
            }}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white shrink-0">
                  {message.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium text-sm truncate">{message.name}</h4>
                    {!message.is_read && (
                      <Badge className="bg-primary text-[10px] px-1.5 py-0">New</Badge>
                    )}
                  </div>
                  <p className="text-primary font-medium text-xs sm:text-sm mb-1 truncate">{message.subject}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{message.message}</p>
                  <div className="flex items-center gap-3 sm:gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail size={10} />
                      <span className="truncate max-w-[120px] sm:max-w-none">{message.email}</span>
                    </span>
                    {message.phone && (
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Phone size={10} />
                        {message.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0">
                {format(new Date(message.created_at), 'MMM d')}
              </span>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            No messages found
          </div>
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{selectedMessage?.subject}</DialogTitle>
            <DialogDescription className="text-sm">
              From: {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <p className="text-foreground whitespace-pre-wrap text-sm">{selectedMessage?.message}</p>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
              {selectedMessage?.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {selectedMessage.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {selectedMessage && format(new Date(selectedMessage.created_at), 'PPp')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="flex-1 gap-2"
                onClick={() => {
                  window.open(`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`);
                }}
              >
                <Mail size={16} />
                Reply via Email
              </Button>
              {selectedMessage?.phone && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    window.open(`tel:${selectedMessage.phone}`);
                  }}
                >
                  <Phone size={16} />
                  Call
                </Button>
              )}
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs sm:text-sm">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-display">₹{(stats.totalRevenue / 100).toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs sm:text-sm">Total Bookings</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-display">{stats.totalBookings}</p>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs sm:text-sm">Active Members</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-display">{stats.activeMembers}</p>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs sm:text-sm">Conversion Rate</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-display">
            {stats.totalUsers > 0 ? ((stats.activeMembers / stats.totalUsers) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Popular Classes */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl mb-4 sm:mb-6">POPULAR CLASSES</h3>
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(
            bookings.reduce((acc, booking) => {
              acc[booking.class_name] = (acc[booking.class_name] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([className, count], index) => (
              <div key={className} className="flex items-center gap-3 sm:gap-4">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs sm:text-sm font-medium text-primary shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{className}</span>
                    <span className="text-muted-foreground text-xs sm:text-sm shrink-0 ml-2">{count} bookings</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-red-600 rounded-full transition-all"
                      style={{ width: `${(count / bookings.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          {bookings.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">No booking data yet</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl mb-4 sm:mb-6">ADMIN SETTINGS</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 gap-3">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Receive email alerts for new bookings</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 gap-3">
            <div>
              <p className="font-medium text-sm">Business Hours</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Set your gym operating hours</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 gap-3">
            <div>
              <p className="font-medium text-sm">Membership Plans</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Manage pricing and plan features</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 gap-3">
            <div>
              <p className="font-medium text-sm">Data Export</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Export all data to CSV</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={14} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV('members')} className="gap-2">
                  <Users size={14} /> Export Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV('bookings')} className="gap-2">
                  <Calendar size={14} /> Export Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV('memberships')} className="gap-2">
                  <CreditCard size={14} /> Export Memberships
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV('messages')} className="gap-2">
                  <MessageSquare size={14} /> Export Messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'members': return renderMembers();
      case 'bookings': return renderBookings();
      case 'memberships': return renderMemberships();
      case 'messages': return renderMessages();
      case 'analytics': return renderAnalytics();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} bg-card border-r border-border transition-all duration-300 flex-col fixed h-full z-20 hidden md:flex`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <SidebarContent onItemClick={() => setMobileSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "md:ml-56" : "md:ml-16"} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
            >
              <Menu size={22} />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors hidden md:block"
            >
              {sidebarOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h1 className="font-display text-lg sm:text-2xl uppercase">{activeTab}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant={adminMode ? "default" : "outline"}
              size="sm" 
              onClick={toggleAdminMode}
              className={`gap-1 sm:gap-2 px-2 sm:px-3 transition-all ${
                adminMode 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'border-blue-600 text-blue-600 hover:bg-blue-600/10'
              }`}
            >
              {adminMode ? '⚙️' : '👤'} <span className="hidden sm:inline">{adminMode ? 'Admin' : 'User'}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <button 
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setActiveTab('messages')}
            >
              <Bell size={18} />
              {stats.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full text-[8px] sm:text-[10px] flex items-center justify-center text-white font-medium">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {currentAdmin?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
              </button>
              
              {profileDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border bg-secondary/30">
                      <p className="font-medium text-sm">{currentAdmin?.name || 'Admin'}</p>
                      <p className="text-muted-foreground text-xs truncate">{currentAdmin?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <Users size={14} />
                        View Site
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <Settings size={14} />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Create a new member profile. They will need to register separately to login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={async () => {
                if (!newMember.name || !newMember.email) {
                  toast({ title: "⚠️ Error", description: "Name and email are required", variant: "destructive" });
                  return;
                }
                // Note: This creates a profile but not an auth user
                toast({ 
                  title: "ℹ️ Note", 
                  description: "Profile creation requires user to register first via the signup page",
                });
                setAddMemberDialogOpen(false);
              }}
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Booking Dialog */}
      <Dialog open={createBookingDialogOpen} onOpenChange={setCreateBookingDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Create a booking for a member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <Select value={newBooking.user_id} onValueChange={(v) => setNewBooking({ ...newBooking, user_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name || user.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={newBooking.class_name} onValueChange={(v) => setNewBooking({ ...newBooking, class_name: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Select value={newBooking.time} onValueChange={(v) => setNewBooking({ ...newBooking, time: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trainer (Optional)</Label>
              <Input
                value={newBooking.trainer}
                onChange={(e) => setNewBooking({ ...newBooking, trainer: e.target.value })}
                placeholder="Trainer name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBookingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBooking} disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
