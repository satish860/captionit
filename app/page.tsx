"use client"

import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useDropzone } from "react-dropzone"
import { Upload } from "upload-js"

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
  margin: 50,
}

const thumb: React.CSSProperties = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginLeft: 50,
  width: "auto",
  height: "auto",
  padding: 4,
  boxSizing: "border-box",
}

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
}

const img = {
  display: "block",
  width: 400,
  height: 400,
}

const thumbsContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  margin: "0 5px",
  flex: "1 1 33%",
}

const captionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  margin: "16px 0",
  padding: 10,
}

const thirdContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  margin: "10px 0",
  flex: "1 1 33%",
}

interface ExtendedFile extends File {
  preview: string
}

export default function IndexPage() {
  const [files, setFiles] = useState<ExtendedFile[]>([])
  const [caption, setCaption] = useState("")
  const [Text, setText] = useState("")

  const upload = Upload({
    apiKey: "public_12a1yDhFXdiwiqc5cp4roMGKbtde",
  })

  const uploadComplete = async (fileUrl: string) => {
    var response = await axios.post("api/", {
      url: fileUrl,
    })
    const result = response.data
    const caption = "Caption: "
    const captionIndex = result.indexOf(caption)
    let extractedText
    if (captionIndex !== -1) {
      extractedText = result.substring(captionIndex + caption.length).trim()
    } else {
      extractedText = result.trim()
    }
    setCaption(extractedText)
    console.log("calling open ai ")
    var answer = await axios.post("api/caption", {
      text: extractedText,
    })
    console.log(answer)
    setText(answer.data)
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      )
      const { fileUrl } = await upload.uploadFile(acceptedFiles[0])
      await uploadComplete(fileUrl)
    },
  })

  const style: React.CSSProperties = useMemo(
    () => ({
      ...baseStyle,
    }),
    []
  )

  const thumbs = files.map((file) => (
    <div style={thumbsContainer} key={file.name}>
      <div style={thumb}>
        <div style={thumbInner}>
          <img
            src={file.preview}
            style={img}
            onLoad={() => URL.revokeObjectURL(file.preview)}
            alt={file.name}
          />
        </div>
      </div>
      <div style={captionStyle}>
        <p>{caption}</p>
      </div>
      <div style={thirdContainer}>
        <p>{Text}</p>
      </div>
    </div>
  ))

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  return (
    <>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
    </>
  )
}
