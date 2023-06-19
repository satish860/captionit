"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useCompletion } from "ai/react"
import axios from "axios"
import { useDropzone } from "react-dropzone"
import { Upload } from "upload-js"

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 4,
  borderColor: "black",
  borderStyle: "dashed",
  outline: "none",
  transition: "border .24s ease-in-out",
  marginTop: "10px",
  marginRight: "35px",
  width: "auto",
  alignItems: "center",
  color: "black",
}

const thumb: React.CSSProperties = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
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
  width: 650,
  height: 450,
}

const thumbsContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  marginTop: "10px",
}

const captionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: "20px",
  fontSize: "1.1em",
  color: "black"
}

const thirdContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: 10,
  fontSize: "1.1em",
  marginTop: "20px",
  color: "black"
}

const heading: React.CSSProperties = {
  fontSize: "2em",
  color: "black",
}

interface ExtendedFile extends File {
  preview: string
}

export default function IndexPage() {
  const defaultImageUrl =
    "https://replicate.delivery/mgxm/f4e50a7b-e8ca-432f-8e68-082034ebcc70/demo.jpg"
  const [files, setFiles] = useState([
    {
      name: "default-image",
      preview: defaultImageUrl,
    },
  ])
  const [caption, setCaption] = useState(
    "a woman sitting on the beach with a dog"
  )
  const [isLoad, setIsLoad] = useState(false)

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/caption",
  })

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
    setIsLoad(false)
    setCaption(extractedText)
    console.log("calling open ai ")
    complete(extractedText)
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
      setIsLoad(true)
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
    </div>
  ))

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  const page: React.CSSProperties = {
    display: "flex",
    width: "100%",
    color: "black",
  }

  const formatApiResult = (result: any) => {
    if (result && result.data) {
      const formattedResult = result.data.replace(/-/g, "-\n")
      console.log(formattedResult)
      return formattedResult
    }
    return ""
  }

  return (
    <>
      <div style={page}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "100px",
            width: "50%",
            marginTop: "20px",
          }}
        >
          <h1 style={heading}>Input</h1>
          <div style={thumbsContainer}>{thumbs}</div>
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <p>Drag and drop some files here or click to select files</p>
            <em>(Only *.jpeg and *.png images will be accepted)</em>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            marginRight: "50px",
            marginTop: "20px",
          }}
        >
          <h2 style={heading}>Output</h2>
          <div style={captionStyle}>
            {isLoad ? (
              <div>Generating image description...</div>
            ) : (
              <p>Description: {caption}</p>
            )}
          </div>
          <div style={thirdContainer}>
            <p>{completion}</p>
          </div>
        </div>
      </div>
    </>
  )
}
