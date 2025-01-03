import { Component, OnInit } from '@angular/core';
import { Employee, EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { NavbarComponent } from "../navbar/navbar.component";
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  employeeId: number = 0;
  employeeName: string = '';
  employeeUsername: string = '';
  employeePassword: string = '';
  employeeRole: string = 'EMPLOYEE';
  employeeData: any = {};  // Holds employee data for editing
  allEmployees: Employee[] = [];
  message: string = '';
  subject !: string;
  classesTaught: string[] = [];
  classesTaughtString: string = '';

  searchQuery: string = '';
  isLoading: boolean = true;
  action: 'create' | 'update' = 'create';

  employees: Employee[] = [];  // Store all employees
  filteredList: Employee[] = [];   // Filtered employees
  paginatedEmployees: Employee[] = []; // Current page employees
  currentPage: number = 0;
  itemsPerPage: number = 5;

  constructor(private employeeService: EmployeeService, private router: Router) { }
  ngOnInit(): void {
    this.fetchAllEmployees();
    this.updatePagination();
  }

  // Open modal for create or update
  openModal(modalId: string, action: 'create' | 'update', employeeId?: number): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      this.action = action;

      if (action === 'update' && employeeId) {
        this.employeeId = employeeId; // Save the ID of the employee to update
        this.fetchEmployeeDataForUpdate(employeeId); // Fetch data for update
      } else {
        this.resetForm(); // Reset form for creating new employee
      }
    } else {
      console.error('Modal element not found');
    }
  }

  // Close modal
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal!.hide();
    } else {
      console.error('Modal element not found');
    }
  }

  // Create a new employee
  createEmployee(): void {
    this.classesTaught = this.classesTaughtString.split(',').map(item => item.trim());

    const employeeData = {
      name: this.employeeName,
      subject: this.subject,
      classesTaught: this.classesTaught,
      user: {
        username: this.employeeUsername,
        password: this.employeePassword,
        role: this.employeeRole
      }
    };

    this.employeeService.createEmployee(employeeData).subscribe(
      response => {
        this.message = 'Employee created successfully';
        console.log(response);
        this.fetchAllEmployees(); // Refresh employee list
        this.closeModal('employeeModal');
        alert('Employee created successfully');
      },
      error => {
        this.message = 'Error creating employee';
        console.error(error);
      }
    );
  }
  // Update employee details
  updateEmployee(): void {
    const updatedEmployeeData = {
      name: this.employeeName,
      subject: this.subject,
      classesTaught: this.classesTaught,
      user: {
        username: this.employeeUsername,
        password: this.employeePassword,
        role: this.employeeRole
      }
    };

    this.employeeService.updateEmployee(this.employeeId, updatedEmployeeData).subscribe(
      response => {
        this.message = 'Employee updated successfully';
        console.log(response);
        alert('Employee updated successfully');
        this.fetchAllEmployees(); // Refresh employee list
        this.closeModal('employeeModal');
      },
      error => {
        this.message = 'Error updating employee';
        console.error(error);
      }
    );
  }

  // Delete employee by ID
  deleteEmployee(employeeId: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe(
        response => {
          this.message = 'Employee deleted successfully';
          console.log(response);

          this.fetchAllEmployees(); // Refresh employee list
        },
        error => {
          this.message = 'Error deleting employee';
          console.error(error);
        }
      );
    }
  }

  // Fetch employee details for updating
  fetchEmployeeDataForUpdate(employeeId: number): void {
    this.employeeService.getEmployeeProfile(employeeId).subscribe(
      response => {
        this.employeeData = response;
        this.employeeName = this.employeeData.name;
        this.employeeUsername = this.employeeData.user.username;
        this.subject = this.employeeData.subject || '';
        this.classesTaughtString = this.employeeData.classesTaught.join(', ') || '';
      },
      error => {
        this.message = 'Error fetching employee data';
        console.error(error);
      }
    );
  }


  // Fetch all employees
  fetchAllEmployees(): void {
    this.isLoading = true;
    this.employeeService.getAllEmployees().subscribe(
      response => {
        this.employees = response;
        this.filterEmployees(); // This will also update pagination
        this.isLoading = false;
      },
      error => {
        this.message = 'Error fetching employees';
        this.isLoading = false;
        console.error(error);
      }
    );
  }

  // Update pagination method
  updatePagination(): void {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.filteredList.slice(startIndex, endIndex);
  }


  goToNextPage(): void {
    if ((this.currentPage + 1) * this.itemsPerPage < this.filteredList.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.itemsPerPage);
  }

  // Add search query handler
  onSearchQueryChange(): void {
    this.filterEmployees();
  }

  resetForm(): void {
    this.employeeName = '';
    this.employeeUsername = '';
    this.employeePassword = '';
    this.employeeRole = 'EMPLOYEE';
    this.subject = '';
    this.classesTaughtString = '';
  }


  // filteredEmployees(): Employee[] {
  //   const query = this.searchQuery.toLowerCase();
  //   return this.employees.filter(
  //     (employee) =>
  //       employee.id.toString().includes(query) ||
  //       employee.name.toLowerCase().includes(query)
  //   );
  // }

  // filter method
  private filterEmployees(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredList = [...this.employees];
    } else {
      this.filteredList = this.employees.filter(
        (employee) =>
          employee.id.toString().includes(query) ||
          employee.name.toLowerCase().includes(query)
      );
    }
    this.currentPage = 0; // Reset to first page when filtering
    this.updatePagination();
  }
}