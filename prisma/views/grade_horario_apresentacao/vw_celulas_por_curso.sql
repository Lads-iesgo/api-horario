SELECT
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `curso`,
  `g`.`idGrade` AS `idGrade`,
  `g`.`semestreLetivo` AS `semestreLetivo`,
  `g`.`anoLetivo` AS `anoLetivo`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `disciplina`,
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `professor`,
  `ds`.`idDiaSemana` AS `idDiaSemana`,
  `ds`.`diaSemana` AS `dia_semana`,
  `ah`.`idSala` AS `idSala`
FROM
  (
    (
      (
        (
          (
            `grade_horario_apresentacao`.`alocacao_horario` `ah`
            JOIN `grade_horario_apresentacao`.`grade` `g` ON((`ah`.`idGrade` = `g`.`idGrade`))
          )
          JOIN `grade_horario_apresentacao`.`curso` `c` ON((`g`.`idCurso` = `c`.`idCurso`))
        )
        JOIN `grade_horario_apresentacao`.`disciplina` `d` ON((`ah`.`idDisciplina` = `d`.`idDisciplina`))
      )
      JOIN `grade_horario_apresentacao`.`professor` `p` ON((`ah`.`idProfessor` = `p`.`idProfessor`))
    )
    JOIN `grade_horario_apresentacao`.`dia_semana` `ds` ON((`ah`.`idDiaSemana` = `ds`.`idDiaSemana`))
  )