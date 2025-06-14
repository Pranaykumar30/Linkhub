
import { useState } from 'react';
import { useAdminSupport } from '@/hooks/useAdminSupport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, Eye, Edit, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminSupportManager = () => {
  const { tickets, loading, updating, updateTicketStatus, deleteTicket, getTicketsByStatus } = useAdminSupport();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    const config = {
      'high': { label: 'High', variant: 'destructive' as const, icon: AlertCircle },
      'normal': { label: 'Normal', variant: 'default' as const, icon: Clock },
      'low': { label: 'Low', variant: 'secondary' as const, icon: CheckCircle }
    };
    
    const priorityConfig = config[priority as keyof typeof config] || config.normal;
    const IconComponent = priorityConfig.icon;
    
    return (
      <Badge variant={priorityConfig.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {priorityConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'open': { label: 'Open', variant: 'destructive' as const },
      'in_progress': { label: 'In Progress', variant: 'default' as const },
      'resolved': { label: 'Resolved', variant: 'secondary' as const },
      'closed': { label: 'Closed', variant: 'outline' as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.open;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const handleUpdateTicket = async (ticketId: string, status: string, priority?: string) => {
    await updateTicketStatus(ticketId, status, priority);
    setSelectedTicket(null);
  };

  const openTickets = getTicketsByStatus('open');
  const inProgressTickets = getTicketsByStatus('in_progress');
  const resolvedTickets = getTicketsByStatus('resolved');
  const closedTickets = getTicketsByStatus('closed');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  const TicketTable = ({ tickets: tableTickets }: { tickets: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableTickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium">{ticket.subject}</TableCell>
            <TableCell className="font-mono text-sm">{ticket.user_id.substring(0, 8)}...</TableCell>
            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
            <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Support Ticket Details</DialogTitle>
                      <DialogDescription>
                        Manage and respond to support ticket
                      </DialogDescription>
                    </DialogHeader>
                    {selectedTicket && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Ticket Info</h4>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm text-muted-foreground">Subject:</span>
                                <p className="font-medium">{selectedTicket.subject}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">User ID:</span>
                                <p className="font-mono text-sm">{selectedTicket.user_id}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Created:</span>
                                <p>{new Date(selectedTicket.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Current Status</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Priority:</span>
                                {getPriorityBadge(selectedTicket.priority)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                {getStatusBadge(selectedTicket.status)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Message</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Update Status</h4>
                            <Select
                              defaultValue={selectedTicket.status}
                              onValueChange={(value) => handleUpdateTicket(selectedTicket.id, value)}
                              disabled={updating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Update Priority</h4>
                            <Select
                              defaultValue={selectedTicket.priority}
                              onValueChange={(value) => handleUpdateTicket(selectedTicket.id, selectedTicket.status, value)}
                              disabled={updating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t">
                          <Button
                            variant="destructive"
                            onClick={() => deleteTicket(selectedTicket.id)}
                            disabled={updating}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Ticket
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTicket(ticket.id)}
                  disabled={updating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Ticket Management
          </CardTitle>
          <CardDescription>
            Manage and respond to user support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search tickets by subject, user ID, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{openTickets.length}</div>
                <div className="text-sm text-muted-foreground">Open</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{inProgressTickets.length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{resolvedTickets.length}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{closedTickets.length}</div>
                <div className="text-sm text-muted-foreground">Closed</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Tickets ({filteredTickets.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTickets.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TicketTable tickets={filteredTickets} />
            </TabsContent>

            <TabsContent value="open">
              <TicketTable tickets={openTickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
              )} />
            </TabsContent>

            <TabsContent value="in_progress">
              <TicketTable tickets={inProgressTickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
              )} />
            </TabsContent>

            <TabsContent value="resolved">
              <TicketTable tickets={resolvedTickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
              )} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportManager;
