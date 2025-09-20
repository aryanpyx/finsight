import { type User, type InsertUser, type UploadedFile, type InsertFile, type AnalysisResult, type InsertAnalysisResult, type Proposal, type InsertProposal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<UploadedFile>;
  getFiles(): Promise<UploadedFile[]>;
  getFilesByType(type: string): Promise<UploadedFile[]>;
  updateFileContent(id: string, content: string, processed: boolean): Promise<UploadedFile | undefined>;
  
  // Analysis operations
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResults(): Promise<AnalysisResult[]>;
  getAnalysisResultsByType(type: string): Promise<AnalysisResult[]>;
  
  // Proposal operations
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  getLatestProposal(): Promise<Proposal | undefined>;
  getProposals(): Promise<Proposal[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private files: Map<string, UploadedFile>;
  private analysisResults: Map<string, AnalysisResult>;
  private proposals: Map<string, Proposal>;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.analysisResults = new Map();
    this.proposals = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFile(insertFile: InsertFile): Promise<UploadedFile> {
    const id = randomUUID();
    const file: UploadedFile = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
      processed: false,
      content: insertFile.content || null,
    };
    this.files.set(id, file);
    return file;
  }

  async getFiles(): Promise<UploadedFile[]> {
    return Array.from(this.files.values());
  }

  async getFilesByType(type: string): Promise<UploadedFile[]> {
    return Array.from(this.files.values()).filter(file => file.type === type);
  }

  async updateFileContent(id: string, content: string, processed: boolean): Promise<UploadedFile | undefined> {
    const file = this.files.get(id);
    if (file) {
      const updatedFile = { ...file, content, processed };
      this.files.set(id, updatedFile);
      return updatedFile;
    }
    return undefined;
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const result: AnalysisResult = {
      ...insertResult,
      id,
      createdAt: new Date(),
      details: insertResult.details || null,
      description: insertResult.description || null,
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async getAnalysisResults(): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values());
  }

  async getAnalysisResultsByType(type: string): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values()).filter(result => result.type === type);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const proposal: Proposal = {
      ...insertProposal,
      id,
      createdAt: new Date(),
      totalImpact: insertProposal.totalImpact || null,
      oneTimeRecovery: insertProposal.oneTimeRecovery || null,
      annualSavings: insertProposal.annualSavings || null,
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async getLatestProposal(): Promise<Proposal | undefined> {
    const proposals = Array.from(this.proposals.values());
    if (proposals.length === 0) return undefined;
    return proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }
}

export const storage = new MemStorage();
