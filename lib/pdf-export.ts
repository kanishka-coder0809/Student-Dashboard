import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface StudentPDFData {
  id: string | number
  name: string
  roll_no: string
  class: string
  attendance_percentage: number
  email?: string
  marks?: Array<{
    subject: string
    marks_obtained: number
    max_marks?: number
    grade: string
    homework_status: string
    teacher_comments: string
  }>
}

export const generateStudentPDF = async (student: StudentPDFData) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 15

  // Header with gradient background
  pdf.setFillColor(99, 102, 241) // Indigo
  pdf.rect(0, 0, pageWidth, 30, 'F')

  // Title
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont(undefined, 'bold')
  pdf.text('Student Report', 15, 20)

  // Student Info Section
  yPosition = 40
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(14)
  pdf.setFont(undefined, 'bold')
  pdf.text('Student Information', 15, yPosition)

  yPosition += 10
  pdf.setFontSize(11)
  pdf.setFont(undefined, 'normal')
  pdf.text(`Name: ${student.name}`, 15, yPosition)
  yPosition += 7
  pdf.text(`Roll No: ${student.roll_no}`, 15, yPosition)
  yPosition += 7
  pdf.text(`Class: ${student.class}`, 15, yPosition)
  yPosition += 7
  pdf.text(`Monthly Attendance: ${student.attendance_percentage}%`, 15, yPosition)
  if (student.email) {
    yPosition += 7
    pdf.text(`Email: ${student.email}`, 15, yPosition)
  }

  // Marks Section
  if (student.marks && student.marks.length > 0) {
    yPosition += 15
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('Academic Record', 15, yPosition)

    yPosition += 10
    
    // Table headers
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setFillColor(229, 231, 235) // Light gray
    
    const headers = ['Subject', 'Marks', 'Max', 'Grade', 'Homework', 'Comments']
    const colWidths = [35, 18, 15, 18, 20, 50]
    let xPosition = 15

    headers.forEach((header, idx) => {
      pdf.text(header, xPosition, yPosition)
      xPosition += colWidths[idx]
    })

    yPosition += 8
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(9)

    // Table rows
    student.marks.forEach((mark) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 15
      }

      xPosition = 15
      pdf.text(mark.subject.substring(0, 12), xPosition, yPosition)
      xPosition += colWidths[0]
      pdf.text(mark.marks_obtained.toString(), xPosition, yPosition)
      xPosition += colWidths[1]
      const maxMarks = mark.max_marks || 100
      pdf.text(maxMarks.toString(), xPosition, yPosition)
      xPosition += colWidths[2]
      pdf.text(mark.grade, xPosition, yPosition)
      xPosition += colWidths[3]
      pdf.text(mark.homework_status.substring(0, 10), xPosition, yPosition)
      xPosition += colWidths[4]
      pdf.text(mark.teacher_comments?.substring(0, 20) || '-', xPosition, yPosition)

      yPosition += 7
    })
  }

  // Footer
  yPosition = pageHeight - 15
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()} | Page ${pdf.internal.pages.length}`,
    15,
    yPosition
  )

  return pdf
}

export const generateAllStudentsPDF = async (students: StudentPDFData[]) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 15

  // Header
  pdf.setFillColor(99, 102, 241)
  pdf.rect(0, 0, pageWidth, 25, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(22)
  pdf.setFont(undefined, 'bold')
  pdf.text('Student Management Report', 15, 18)

  yPosition = 35

  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')

  // Table headers
  const headers = ['Name', 'Roll No', 'Class', 'Attendance %', 'Total Subjects', 'Avg Marks']
  const colWidths = [50, 30, 30, 35, 35, 35]

  let xPosition = 15
  pdf.setFillColor(229, 231, 235)
  headers.forEach((header, idx) => {
    pdf.text(header, xPosition, yPosition)
    xPosition += colWidths[idx]
  })

  yPosition += 8
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)

  // Table rows
  students.forEach((student) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = 15
    }

    const avgMarks =
      student.marks && student.marks.length > 0
        ? (
            student.marks.reduce((sum, m) => sum + m.marks_obtained, 0) /
            student.marks.length
          ).toFixed(1)
        : '-'

    xPosition = 15
    pdf.text(student.name.substring(0, 20), xPosition, yPosition)
    xPosition += colWidths[0]
    pdf.text(student.roll_no, xPosition, yPosition)
    xPosition += colWidths[1]
    pdf.text(student.class, xPosition, yPosition)
    xPosition += colWidths[2]
    pdf.text(`${student.attendance_percentage}%`, xPosition, yPosition)
    xPosition += colWidths[3]
    pdf.text((student.marks?.length || 0).toString(), xPosition, yPosition)
    xPosition += colWidths[4]
    pdf.text(avgMarks.toString(), xPosition, yPosition)

    yPosition += 8
  })

  return pdf
}
